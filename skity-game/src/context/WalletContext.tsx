/**
 * Wallet Context - Manages Lace wallet connection and Midnight providers
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import "@midnight-ntwrk/dapp-connector-api";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import {
  createProofProvider,
  type MidnightProvider as MidnightTxProvider,
  type MidnightProviders,
  type ProofProvider,
  type UnboundTransaction,
  type WalletProvider as MidnightWalletProvider,
} from "@midnight-ntwrk/midnight-js-types";
import {
  Transaction,
  type FinalizedTransaction,
} from "@midnight-ntwrk/ledger-v8";
import type { GamePrivateState } from "@framed/contract";

export type MidnightGameProviders = MidnightProviders<
  string,
  string,
  GamePrivateState
>;

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  shieldedAddress: string | null;
  connecting: boolean;
  providers: MidnightGameProviders | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

type InjectedWalletAPI = {
  connect?: (networkId: string) => Promise<ConnectedAPI>;
  enable?: () => Promise<ConnectedAPI>;
  isEnabled?: () => Promise<boolean>;
};

type MidnightWindow = Window & {
  midnight?: Record<string, unknown> & {
    mnLace?: InjectedWalletAPI;
  };
};

type WalletAddressInfo = {
  shieldedAddress?: string;
  shield?: string;
  address?: string;
  coinPublicKey?: string;
  shieldedCoinPublicKey?: string;
  publicKey?: string;
  cpk?: string;
  coinPubKey?: string;
  shieldedEncryptionPublicKey?: string;
  encryptionPublicKey?: string;
  encPublicKey?: string;
  epk?: string;
  0?: WalletAddressInfo;
};

type LegacyConnectedAPI = ConnectedAPI & {
  getAddresses?: () => Promise<WalletAddressInfo>;
  state?: () => Promise<{ addresses?: WalletAddressInfo } | WalletAddressInfo>;
};

const normalizeServiceUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;

  const normalized = value
    .trim()
    .replace(/^['"`\s]+|['"`\s]+$/g, "")
    .replace(/\/+$/, "");

  return normalized || undefined;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const deserializeBytes = (value: string): Uint8Array => {
  const trimmed = value.trim();
  const cleanHex = trimmed.startsWith("0x") ? trimmed.slice(2) : trimmed;

  if (/^[0-9a-fA-F]+$/.test(cleanHex) && cleanHex.length % 2 === 0) {
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  const decoded = atob(trimmed);
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
};

const serializeTransaction = (
  tx: { serialize(): Uint8Array },
  encoding: "hex" | "base64" = "hex",
): string => {
  const bytes = tx.serialize();
  return encoding === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes);
};

const logUnknownError = (label: string, error: unknown) => {
  if (error instanceof Error) {
    const errorWithCause = error as Error & { cause?: unknown };
    console.error(label, error);
    console.error("   name:", error.name);
    console.error("   message:", error.message);
    console.error("   stack:", error.stack);
    console.error("   cause:", errorWithCause.cause);
    return;
  }

  console.error(label, error);
};

const deserializeBalancedTransaction = (
  serializedTx: string,
): FinalizedTransaction =>
  Transaction.deserialize(
    "signature",
    "proof",
    "binding",
    deserializeBytes(serializedTx),
  ) as FinalizedTransaction;

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [encryptionPublicKey, setEncryptionPublicKey] = useState<string | null>(
    null,
  );
  const [walletProofProvider, setWalletProofProvider] =
    useState<ProofProvider | null>(null);
  const [serviceConfig, setServiceConfig] = useState<{
    indexerUri?: string;
    indexerWsUri?: string;
    proverServerUri?: string;
  } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectedAPI, setConnectedAPI] = useState<ConnectedAPI | null>(null);

  // ZK Config Provider (browser-compatible)
  const zkConfigProvider = useMemo(
    () =>
      new FetchZkConfigProvider(
        `${window.location.origin}/zk-keys`,
        fetch.bind(window),
      ),
    [],
  );

  // Proof provider - use local proof server
  const proofProvider = useMemo(() => {
    // Use local proof server for development
    const resolvedProofServerUri = "http://localhost:6300";

    console.log("🧪 Using local proof server:", resolvedProofServerUri);

    return httpClientProofProvider(resolvedProofServerUri, zkConfigProvider);
  }, [zkConfigProvider]);

  // Private state provider
  const privateStateProvider = useMemo(
    () =>
      levelPrivateStateProvider<string, GamePrivateState>({
        privateStateStoreName: "framed-game-private-state",
        signingKeyStoreName: "framed-signing-keys",
        privateStoragePasswordProvider: () => "framed-game-password-2024",
        accountId: walletAddress || "default-account",
      }),
    [walletAddress],
  );

  // Public data provider - use preprod indexer
  const publicDataProvider = useMemo(
    () =>
      indexerPublicDataProvider(
        normalizeServiceUrl(serviceConfig?.indexerUri) ||
          "https://indexer.preprod.midnight.network/api/v3/graphql",
        normalizeServiceUrl(serviceConfig?.indexerWsUri) ||
          "wss://indexer.preprod.midnight.network/api/v3/graphql/ws",
      ),
    [serviceConfig],
  );

  // Wallet provider (wraps Lace API)
  const walletProvider = useMemo<MidnightWalletProvider | null>(() => {
    if (!connectedAPI) return null;

    return {
      getCoinPublicKey: () => {
        // ConnectedAPI doesn't expose this directly, use a placeholder
        return walletAddress || "";
      },
      getEncryptionPublicKey: () => {
        return encryptionPublicKey || "";
      },
      balanceTx: async (tx: UnboundTransaction) => {
        console.log("🧾 Balancing transaction via Lace");
        console.log("   Unbound tx bytes:", tx.serialize().length);
        console.log("   Unbound tx first 100 bytes:", Array.from(tx.serialize().slice(0, 100)).map(b => b.toString(16).padStart(2, '0')).join(''));

        const encodings: Array<"hex" | "base64"> = ["hex", "base64"];
        let lastError: unknown;

        for (const encoding of encodings) {
          const serializedTx = serializeTransaction(tx, encoding);
          console.log(`   Trying ${encoding} encoding`);
          console.log("   Serialized tx length:", serializedTx.length);
          console.log("   Serialized tx first 200 chars:", serializedTx.substring(0, 200));

          try {
            const result =
              await connectedAPI.balanceUnsealedTransaction(serializedTx);

            console.log("✅ Lace balanced transaction");
            console.log("   Encoding:", encoding);
            console.log("   Balanced tx string length:", result.tx.length);

            const finalizedTx = deserializeBalancedTransaction(result.tx);
            console.log(
              "   Balanced tx identifiers:",
              finalizedTx.identifiers(),
            );
            return finalizedTx;
          } catch (error) {
            lastError = error;
            logUnknownError(
              `❌ Failed while balancing transaction in Lace using ${encoding}:`,
              error,
            );
          }
        }

        throw lastError;
      },
    };
  }, [connectedAPI, walletAddress, encryptionPublicKey]);

  // Midnight provider (wraps Lace API)
  const midnightProvider = useMemo<MidnightTxProvider | null>(() => {
    if (!connectedAPI) return null;

    return {
      submitTx: async (tx: FinalizedTransaction): Promise<string> => {
        try {
          const identifiers = tx.identifiers();

          console.log("📤 Submitting transaction via Lace");
          console.log("   Finalized tx bytes:", tx.serialize().length);
          console.log("   Tx identifiers:", identifiers);

          const encodings: Array<"hex" | "base64"> = ["hex", "base64"];
          let lastError: unknown;

          for (const encoding of encodings) {
            const serializedTx = serializeTransaction(tx, encoding);
            console.log(`   Trying ${encoding} encoding`);
            console.log("   Serialized tx length:", serializedTx.length);

            try {
              await connectedAPI.submitTransaction(serializedTx);

              const [txId] = identifiers;
              if (!txId) {
                throw new Error(
                  "Wallet submitted transaction without an identifier",
                );
              }

              console.log("✅ Lace accepted transaction");
              console.log("   Encoding:", encoding);
              console.log("   Tracking tx id:", txId);

              return txId;
            } catch (error) {
              lastError = error;
              logUnknownError(
                `❌ Failed to submit transaction via Lace using ${encoding}:`,
                error,
              );
            }
          }

          throw lastError;
        } catch (error) {
          logUnknownError("Failed to submit transaction:", error);
          throw error;
        }
      },
    };
  }, [connectedAPI]);

  // Combined providers
  const providers = useMemo<MidnightGameProviders | null>(() => {
    if (!walletProvider || !midnightProvider) return null;

    // Use wallet's proof provider if available (matches wallet version),
    // otherwise use HTTP proof provider
    const selectedProofProvider = walletProofProvider ?? proofProvider;
    console.log("🔧 Using proof provider:", walletProofProvider ? "wallet" : "HTTP");

    return {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider: selectedProofProvider,
      walletProvider,
      midnightProvider,
    };
  }, [
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProofProvider,
    walletProvider,
    midnightProvider,
  ]);

  // Connect to Lace wallet
  const connect = useCallback(async () => {
    if (connecting || isConnected) return;

    setConnecting(true);
    try {
      console.log("🔍 Checking for Lace wallet...");

      // Wait a bit for extension to inject (especially important in Brave)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if midnight object exists
      const midnightObj = (window as MidnightWindow).midnight;
      if (typeof window === "undefined" || !midnightObj) {
        throw new Error(
          "Lace wallet not found. Please install the Lace extension and refresh the page.",
        );
      }

      console.log("window.midnight:", midnightObj);

      // Try multiple approaches to find the wallet API
      let walletAPI: InjectedWalletAPI | null = null;
      let api: ConnectedAPI | null = null;

      // Approach 1: Try mnLace (standard Lace API)
      if (midnightObj.mnLace) {
        console.log("🔌 Found mnLace API");
        walletAPI = midnightObj.mnLace;

        try {
          const isEnabled = await walletAPI.isEnabled?.();
          console.log("Wallet enabled status:", isEnabled);

          if (typeof walletAPI.connect === "function") {
            console.log("Connecting wallet via connect('preprod')...");
            api = await walletAPI.connect("preprod");
          } else if (typeof walletAPI.enable === "function") {
            console.log("Enabling wallet...");
            api = await walletAPI.enable();
          }
        } catch (err) {
          console.warn("mnLace enable failed, trying connect:", err);
          // Try connect method as fallback
          api = await walletAPI.connect?.("preprod");
        }
      }

      // Approach 2: Try UUID-based keys (alternative Lace API structure)
      if (!api) {
        const walletKeys = Object.keys(midnightObj).filter(
          (key) => key !== "mnLace" && typeof midnightObj[key] === "object",
        );
        console.log("Available wallet keys:", walletKeys);

        for (const walletKey of walletKeys) {
          try {
            console.log(`🔌 Trying wallet key: ${walletKey}`);
            walletAPI = midnightObj[walletKey];

            // Try different connection methods
            if (typeof walletAPI.connect === "function") {
              api = await walletAPI.connect("preprod");
            } else if (typeof walletAPI.enable === "function") {
              api = await walletAPI.enable();
            }

            if (api) {
              console.log(`✅ Connected via ${walletKey}`);
              break;
            }
          } catch (err) {
            console.warn(`Failed with key ${walletKey}:`, err);
            continue;
          }
        }
      }

      if (!api) {
        throw new Error(
          "Failed to connect to Lace wallet. Please make sure:\n1. Lace extension is installed\n2. You have a Midnight wallet created\n3. You are on the Preprod network\n4. The extension has permission to access this site",
        );
      }

      console.log("✅ Lace wallet connected, getting addresses...");
      console.log("🧩 Connected API methods:", Object.keys(api));

      try {
        if (typeof api.getConfiguration === "function") {
          const config = await api.getConfiguration();
          setServiceConfig({
            indexerUri: normalizeServiceUrl(config.indexerUri),
            indexerWsUri: normalizeServiceUrl(config.indexerWsUri),
            proverServerUri: normalizeServiceUrl(config.proverServerUri),
          });
          console.log("🛰️ Wallet service config:", {
            ...config,
            proverServerUri: normalizeServiceUrl(config.proverServerUri),
          });
        } else {
          setServiceConfig(null);
          console.log("⚠️ Connected API has no getConfiguration()");
        }

        try {
          const provingProvider = await api.getProvingProvider(
            zkConfigProvider as never,
          );
          setWalletProofProvider(createProofProvider(provingProvider));
          console.log("🧠 Using wallet proving provider (FORCED)");
        } catch (providerError) {
          console.error(
            "❌ CRITICAL: Failed to get wallet proving provider. This is required for compatibility:",
            providerError,
          );
          throw new Error("Wallet proving provider is required but not available. Please update your Lace wallet extension.");
        }
      } catch (providerError) {
        console.warn(
          "⚠️ Failed to initialize wallet service providers, falling back to HTTP providers:",
          providerError,
        );
        setWalletProofProvider(null);
      }

      // Get wallet addresses
      let addresses: WalletAddressInfo | undefined;
      try {
        const legacyApi = api as LegacyConnectedAPI;
        // Try different methods to get addresses
        if (typeof api.getShieldedAddresses === "function") {
          addresses = await api.getShieldedAddresses();
        } else if (typeof legacyApi.getAddresses === "function") {
          addresses = await legacyApi.getAddresses();
        } else if (typeof legacyApi.state === "function") {
          const state = await legacyApi.state();
          if ("addresses" in state) {
            addresses = state.addresses;
          } else {
            addresses = state as WalletAddressInfo;
          }
        }
      } catch (err) {
        console.error("Failed to get addresses:", err);
        throw new Error(
          "Failed to get wallet addresses. Please make sure you have a Midnight wallet created in Lace.",
        );
      }

      console.log("📊 Wallet addresses response:", addresses);
      console.log("📊 Address keys:", Object.keys(addresses || {}));
      console.log(
        "📊 Full addresses object:",
        JSON.stringify(addresses, null, 2),
      );

      // Extract shielded address for display only.
      const shieldedAddr =
        addresses?.shieldedAddress ||
        addresses?.shield ||
        addresses?.[0]?.shieldedAddress ||
        addresses?.address;

      // Extract the shielded coin public key used by Midnight transactions.
      const coinPublicKey =
        addresses?.coinPublicKey ||
        addresses?.shieldedCoinPublicKey ||
        addresses?.publicKey ||
        addresses?.cpk ||
        addresses?.coinPubKey ||
        addresses?.[0]?.coinPublicKey ||
        addresses?.[0]?.shieldedCoinPublicKey;

      const shieldedEncryptionPublicKey =
        addresses?.shieldedEncryptionPublicKey ||
        addresses?.encryptionPublicKey ||
        addresses?.encPublicKey ||
        addresses?.epk ||
        addresses?.[0]?.shieldedEncryptionPublicKey ||
        addresses?.[0]?.encryptionPublicKey;

      if (!coinPublicKey) {
        console.error("No addresses found in response:", addresses);
        console.error("Available keys:", Object.keys(addresses || {}));
        throw new Error(
          "No shielded coin public key found. Please ensure:\n" +
            "1. You have a Midnight wallet created in Lace\n" +
            "2. You are on the Preprod network\n" +
            "3. Your Lace extension is up to date\n" +
            "4. Try disconnecting and reconnecting your wallet",
        );
      }

      if (!shieldedEncryptionPublicKey) {
        console.error("No encryption public key found in response:", addresses);
        throw new Error(
          "No shielded encryption public key found. Please ensure:\n" +
            "1. You have a Midnight wallet created in Lace\n" +
            "2. You are on the Preprod network\n" +
            "3. Your Lace extension is up to date\n" +
            "4. Try disconnecting and reconnecting your wallet",
        );
      }

      setConnectedAPI(api);
      setShieldedAddress(shieldedAddr || null);
      setEncryptionPublicKey(shieldedEncryptionPublicKey);
      setWalletAddress(coinPublicKey); // Use shielded coin public key for contract/provider operations
      setIsConnected(true);

      console.log("✅ Successfully connected to Lace wallet");
      console.log("   Wallet Address (for contract):", coinPublicKey);
      console.log("   Encryption Public Key:", shieldedEncryptionPublicKey);
      console.log(
        "   Shielded Address (for display):",
        shieldedAddr || "using wallet address",
      );
    } catch (error) {
      console.error("❌ Failed to connect to wallet:", error);
      setConnecting(false);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [connecting, isConnected]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setShieldedAddress(null);
    setEncryptionPublicKey(null);
    setWalletProofProvider(null);
    setServiceConfig(null);
    setConnectedAPI(null);
    console.log("🔌 Disconnected from wallet");
  }, []);

  // Auto-connect if previously authorized
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const api = (window as MidnightWindow).midnight?.mnLace;
        if (api && typeof api.isEnabled === "function") {
          const enabled = await api.isEnabled();
          if (enabled && !cancelled && !isConnected) {
            await connect();
          }
        }
      } catch (err) {
        console.warn("Auto-connect failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connect, isConnected]);

  const value: WalletContextType = {
    isConnected,
    walletAddress,
    shieldedAddress,
    connecting,
    providers,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

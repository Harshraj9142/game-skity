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
  type MidnightProviders,
  type ProofProvider,
} from "@midnight-ntwrk/midnight-js-types";
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

const normalizeServiceUrl = (value?: string | null): string | undefined => {
  if (!value) return undefined;

  const normalized = value
    .trim()
    .replace(/^['"`\s]+|['"`\s]+$/g, "")
    .replace(/\/+$/, "");

  return normalized || undefined;
};

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

  // Proof provider - use preprod proof server
  const proofProvider = useMemo(() => {
    if (walletProofProvider) {
      return walletProofProvider;
    }

    const proofServerUri = normalizeServiceUrl(serviceConfig?.proverServerUri);
    const resolvedProofServerUri =
      proofServerUri || "https://prover.preprod.midnight.network";

    console.log("🧪 Using HTTP proof server:", resolvedProofServerUri);

    return httpClientProofProvider(resolvedProofServerUri, zkConfigProvider);
  }, [walletProofProvider, serviceConfig, zkConfigProvider]);

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
  const walletProvider = useMemo(() => {
    if (!connectedAPI) return null;

    return {
      getCoinPublicKey: () => {
        // ConnectedAPI doesn't expose this directly, use a placeholder
        return walletAddress || "";
      },
      getEncryptionPublicKey: () => {
        return encryptionPublicKey || "";
      },
      balanceTx: async (tx: any, ttl?: Date) => {
        // Use Lace's balanceUnsealedTransaction for contract calls
        const result = await connectedAPI.balanceUnsealedTransaction(tx);
        return result.tx;
      },
    };
  }, [connectedAPI, walletAddress, encryptionPublicKey]);

  // Midnight provider (wraps Lace API)
  const midnightProvider = useMemo(() => {
    if (!connectedAPI) return null;

    return {
      submitTx: async (tx: any): Promise<string> => {
        try {
          // submitTransaction returns void, but we need to return a transaction ID
          // In practice, the transaction is submitted and we can track it via indexer
          await connectedAPI.submitTransaction(tx);
          // Return a placeholder ID - in production, query indexer for actual tx ID
          return "tx-submitted-" + Date.now();
        } catch (error) {
          console.error("Failed to submit transaction:", error);
          throw error;
        }
      },
    };
  }, [connectedAPI]);

  // Combined providers
  const providers = useMemo<MidnightGameProviders | null>(() => {
    if (!walletProvider || !midnightProvider) return null;

    return {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider: walletProvider as any,
      midnightProvider: midnightProvider as any,
    } as MidnightGameProviders;
  }, [
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
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
      const midnightObj = (window as any).midnight;
      if (typeof window === "undefined" || !midnightObj) {
        throw new Error(
          "Lace wallet not found. Please install the Lace extension and refresh the page.",
        );
      }

      console.log("window.midnight:", midnightObj);

      // Try multiple approaches to find the wallet API
      let walletAPI: any = null;
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

        if (typeof api.getProvingProvider === "function") {
          const provingProvider = await api.getProvingProvider(
            zkConfigProvider as never,
          );
          setWalletProofProvider(createProofProvider(provingProvider));
          console.log("🧠 Using wallet proving provider");
        } else {
          setWalletProofProvider(null);
          console.log(
            "⚠️ Connected API has no getProvingProvider(); using HTTP proof provider",
          );
        }
      } catch (providerError) {
        console.warn(
          "⚠️ Failed to initialize wallet service providers, falling back to HTTP providers:",
          providerError,
        );
        setWalletProofProvider(null);
      }

      // Get wallet addresses
      let addresses: any;
      try {
        // Try different methods to get addresses
        if (typeof api.getShieldedAddresses === "function") {
          addresses = await api.getShieldedAddresses();
        } else if (typeof (api as any).getAddresses === "function") {
          addresses = await (api as any).getAddresses();
        } else if (typeof (api as any).state === "function") {
          const state = await (api as any).state();
          addresses = state?.addresses || state;
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
        const api = (window as any)?.midnight?.mnLace;
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

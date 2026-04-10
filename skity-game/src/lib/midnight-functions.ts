/**
 * Midnight Network Integration Functions
 * Handles all interactions with the Compact smart contract
 */

import {
  Contract,
  ledger,
  witnesses,
  type GamePrivateState,
} from "@framed/contract";
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import type { MidnightGameProviders } from "../context/WalletContext";

// Set network ID - change to 'preprod' for testnet or 'undeployed' for local
setNetworkId("preprod");

type DeployedGameContract = {
  deployTxData: {
    public: {
      contractAddress: string;
      initialContractState: {
        data: Uint8Array;
      };
    };
  };
  callTx: {
    joinGame(): Promise<void>;
    initGame(roleAssignments: bigint[]): Promise<void>;
    castPrivateVote(targetId: bigint, roundSalt: Uint8Array): Promise<void>;
    takeAction(targetId: bigint): Promise<void>;
    blowWhistle(event: {
      location: Uint8Array;
      roundId: bigint;
    }): Promise<void>;
    triggerSabotage(): Promise<void>;
    deactivateSabotage(): Promise<void>;
    advanceToVoting(): Promise<void>;
    startNewRound(): Promise<void>;
    revealTally(moderatorSecret: Uint8Array): Promise<void>;
    completeReveal(eliminatedPlayerAddress: Uint8Array): Promise<void>;
    getPlayerStatus(playerAddress: Uint8Array): Promise<boolean>;
  };
  privateState?: GamePrivateState;
};

// Pre-compile the game contract with ZK circuit assets and witnesses
const gameCompiledContract = CompiledContract.make("game", Contract).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets("/zk-keys"),
);

const findDeployedContractUnsafe = findDeployedContract as unknown as (
  providers: MidnightGameProviders,
  options: {
    contractAddress: string;
    compiledContract: typeof gameCompiledContract;
    privateStateId: string;
    initialPrivateState: GamePrivateState;
  },
) => Promise<DeployedGameContract>;

// Singleton contract instance
let gameContractInstance: DeployedGameContract | null = null;
let currentProviders: MidnightGameProviders | null = null;

/**
 * Generate a deterministic secret key from wallet address
 * This ensures each wallet has a unique but consistent secret key
 * MUST match the witness function implementation exactly
 */
function generateSecretKeyFromWallet(walletAddress: string): Uint8Array {
  // Create a deterministic key from wallet address
  const encoder = new TextEncoder();
  const data = encoder.encode(`framed-sk:${walletAddress}`);

  // Use a deterministic mixing function to generate 32 bytes
  // This MUST match the witness function implementation
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    // Mix the input data with position-dependent values
    key[i] = data[i % data.length] ^ ((i * 7 + 13) & 0xff);
  }

  return key;
}

/**
 * Initialize connection to an existing game contract
 */
export const connectToGame = async (
  contractAddress: string,
  providers: MidnightGameProviders,
  walletAddress: string,
  initialPrivateState?: GamePrivateState,
): Promise<void> => {
  console.log("🔗 Connecting to game contract:", contractAddress);
  console.log("👤 Wallet address:", walletAddress);

  try {
    currentProviders = providers;

    // Generate secret key from wallet address for deterministic key derivation
    const secretKey = generateSecretKeyFromWallet(walletAddress);
    const secretKeyHex = bytesToHex(secretKey);

    // Default private state for new players
    const privateState: GamePrivateState = initialPrivateState || {
      secretKey: secretKeyHex,
      role: 99, // Unknown until assigned
      myVote: 0,
      witnessedEvents: [] as ReadonlyArray<{
        location: string;
        roundId: number;
      }>,
    };

    console.log("🔑 Private state initialized for wallet");

    // Find and connect to the deployed contract
    gameContractInstance = await findDeployedContractUnsafe(providers, {
      contractAddress,
      compiledContract: gameCompiledContract,
      privateStateId: "gamePrivateState",
      initialPrivateState: privateState,
    });

    console.log("✅ Connected to game contract");

    // Verify private state was initialized
    if (!gameContractInstance.privateState) {
      console.warn("⚠️ Private state not initialized, setting manually");
      gameContractInstance.privateState = privateState;
    }
  } catch (error) {
    console.error("❌ Failed to connect to contract:", error);
    throw error;
  }
};

/**
 * Derive public key from secret key (matches contract logic)
 */
const derivePublicKey = async (secretKey: Uint8Array): Promise<Uint8Array> => {
  // Create prefix: pad(32, "framed:pk:")
  const prefixStr = "framed:pk:";
  const prefix = new Uint8Array(32);
  const encoder = new TextEncoder();
  const prefixBytes = encoder.encode(prefixStr);
  prefix.set(prefixBytes);

  // Concatenate prefix ++ secretKey (64 bytes total)
  const combined = new Uint8Array(64);
  combined.set(prefix, 0);
  combined.set(secretKey, 32);

  // Hash using SHA-256 (persistentHash in Compact uses SHA-256)
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);

  return new Uint8Array(hashBuffer);
};

/**
 * Join the game lobby and return the derived public key
 */
export const joinGame = async (walletAddress: string): Promise<string> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("🎮 Joining game...");
  console.log("   Wallet address:", walletAddress);

  try {
    // Get our secret key from private state
    const privateState = gameContractInstance.privateState as
      | GamePrivateState
      | undefined;

    if (!privateState) {
      throw new Error("Private state not initialized");
    }

    const secretKeyHex = privateState.secretKey;
    let secretKey: Uint8Array;

    // If secret key is not in private state, generate it
    if (!secretKeyHex) {
      console.warn(
        "⚠️ Secret key not found in private state, generating new one",
      );
      secretKey = generateSecretKeyFromWallet(walletAddress);
    } else {
      secretKey = hexToBytes(secretKeyHex);
    }

    // Derive our public key BEFORE joining (so we know what to look for)
    const derivedPublicKey = await derivePublicKey(secretKey);
    const derivedKeyHex = bytesToHex(derivedPublicKey);

    console.log("🔑 Our derived public key:", derivedKeyHex);
    console.log("   Calling joinGame circuit...");
    console.log("   Proof server should be at: http://localhost:6300");

    // Now join the game
    await gameContractInstance.callTx.joinGame();

    console.log("✅ Joined game successfully. Derived key:", derivedKeyHex);

    return derivedKeyHex;
  } catch (error) {
    console.error("❌ Failed to join game:", error);

    // Log more details about the error
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Error stack:", error.stack);
      
      // Check if it's a proof server connection issue
      if (error.message.includes("Unable to deserialize Transaction")) {
        console.error("   ⚠️ This looks like a proof server communication issue");
        console.error("   ⚠️ Make sure the proof server is running: docker ps | grep proof-server");
        console.error("   ⚠️ Check proof server logs: docker logs skity-proof-server");
        console.error("   ⚠️ Proof server should be accessible at http://localhost:6300");
      }
    }

    throw error;
  }
};

/**
 * Initialize game and assign roles (host only)
 */
export const initGame = async (
  roleAssignments: number[],
  myRole: number,
): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("🎲 Initializing game with roles:", roleAssignments);

  try {
    // Update private state with assigned role
    gameContractInstance.privateState = {
      ...gameContractInstance.privateState,
      role: myRole,
    };

    const roles = roleAssignments.map((r) => BigInt(r));
    const result = await gameContractInstance.callTx.initGame(roles);
    console.log("✅ Game initialized successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to initialize game:", error);
    throw error;
  }
};

/**
 * Cast a private vote during voting phase
 */
export const castPrivateVote = async (targetId: number): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("🗳️ Casting vote for player:", targetId);

  try {
    // Generate random salt for vote privacy
    const roundSalt = crypto.getRandomValues(new Uint8Array(32));
    const result = await gameContractInstance.callTx.castPrivateVote(
      BigInt(targetId),
      roundSalt,
    );
    console.log("✅ Vote cast successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to cast vote:", error);
    throw error;
  }
};

/**
 * Take action during night phase (kill/save/investigate)
 */
export const takeAction = async (targetId: number): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("🌙 Taking action on player:", targetId);

  try {
    const result = await gameContractInstance.callTx.takeAction(
      BigInt(targetId),
    );
    console.log("✅ Action taken successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to take action:", error);
    throw error;
  }
};

/**
 * Blow whistle - anonymous alert about suspicious activity
 */
export const blowWhistle = async (
  suspectId: number,
  roundId: number,
): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("📢 Blowing whistle on player:", suspectId);

  try {
    // Encode suspect ID in location bytes
    const locationBytes = new Uint8Array(16);
    locationBytes[0] = suspectId & 0xff;

    const event = {
      location: locationBytes,
      roundId: BigInt(roundId),
    };

    const result = await gameContractInstance.callTx.blowWhistle(event);
    console.log("✅ Whistle blown successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to blow whistle:", error);
    throw error;
  }
};

/**
 * Trigger sabotage - Mafia ability to black out voting
 */
export const triggerSabotage = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("💣 Triggering sabotage...");

  try {
    const result = await gameContractInstance.callTx.triggerSabotage();
    console.log("✅ Sabotage triggered successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to trigger sabotage:", error);
    throw error;
  }
};

/**
 * Deactivate sabotage (auto or manual)
 */
export const deactivateSabotage = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("🔆 Deactivating sabotage...");

  try {
    const result = await gameContractInstance.callTx.deactivateSabotage();
    console.log("✅ Sabotage deactivated successfully");
    return result;
  } catch (error) {
    console.error("❌ Failed to deactivate sabotage:", error);
    throw error;
  }
};

/**
 * View your own role from private state
 */
export const viewOwnRole = async (): Promise<number> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("👁️ Viewing own role...");

  try {
    // Access role directly from private state
    const privateState = gameContractInstance.privateState;
    const roleNumber = privateState.role;
    console.log("✅ Role retrieved:", roleNumber);
    return roleNumber;
  } catch (error) {
    console.error("❌ Failed to view role:", error);
    throw error;
  }
};

/**
 * Advance to voting phase (moderator only)
 */
export const advanceToVoting = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("⏭️ Advancing to voting phase...");

  try {
    const result = await gameContractInstance.callTx.advanceToVoting();
    console.log("✅ Advanced to voting phase");
    return result;
  } catch (error) {
    console.error("❌ Failed to advance to voting:", error);
    throw error;
  }
};

/**
 * Start new round (moderator only)
 */
export const startNewRound = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("🔄 Starting new round...");

  try {
    const result = await gameContractInstance.callTx.startNewRound();
    console.log("✅ New round started");
    return result;
  } catch (error) {
    console.error("❌ Failed to start new round:", error);
    throw error;
  }
};

/**
 * Reveal vote tally (moderator only)
 */
export const revealTally = async (
  moderatorSecret: Uint8Array,
): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("🔓 Revealing tally...");

  try {
    const result =
      await gameContractInstance.callTx.revealTally(moderatorSecret);
    console.log("✅ Tally revealed");
    return result;
  } catch (error) {
    console.error("❌ Failed to reveal tally:", error);
    throw error;
  }
};

/**
 * Complete reveal and eliminate player (moderator only)
 */
export const completeReveal = async (
  eliminatedPlayerAddress: Uint8Array,
): Promise<void> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  console.log("⚰️ Completing reveal and eliminating player...");

  try {
    const result = await gameContractInstance.callTx.completeReveal(
      eliminatedPlayerAddress,
    );
    console.log("✅ Reveal completed");
    return result;
  } catch (error) {
    console.error("❌ Failed to complete reveal:", error);
    throw error;
  }
};

/**
 * Get game state from ledger
 */
export const getGameState = async () => {
  if (!gameContractInstance) throw new Error("Contract not connected");
  if (!currentProviders) throw new Error("Providers not initialized");

  try {
    // Query the current contract state from the indexer
    const contractAddress =
      gameContractInstance.deployTxData.public.contractAddress;
    const currentState =
      await currentProviders.publicDataProvider.queryContractState(
        contractAddress,
      );

    if (!currentState) {
      console.warn("No contract state found, using initial state");
      const initialState =
        gameContractInstance.deployTxData.public.initialContractState;
      return ledger(
        initialState.data as unknown as Parameters<typeof ledger>[0],
      );
    }

    const ledgerState = ledger(currentState.data);

    // Log detailed state information
    console.log("📊 Contract state retrieved:");
    console.log("   Player count:", Number(ledgerState.playerCount));
    console.log("   Max players:", Number(ledgerState.maxPlayers));
    console.log("   Game phase:", Number(ledgerState.gamePhase));
    console.log("   Players map size:", ledgerState.players?.size() || 0);
    console.log(
      "   PlayerAddresses map size:",
      ledgerState.playerAddresses?.size() || 0,
    );

    // Log all player addresses
    if (ledgerState.playerAddresses) {
      console.log("   Player addresses in contract:");
      for (const [index, address] of ledgerState.playerAddresses) {
        console.log(`     [${index}]: ${bytesToHex(address)}`);
      }
    }

    return ledgerState;
  } catch (error) {
    console.error("❌ Failed to get game state:", error);
    throw error;
  }
};

/**
 * Get player status
 */
export const getPlayerStatus = async (
  playerAddress: Uint8Array,
): Promise<boolean> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  try {
    const status =
      await gameContractInstance.callTx.getPlayerStatus(playerAddress);
    return status;
  } catch (error) {
    console.error("❌ Failed to get player status:", error);
    throw error;
  }
};

/**
 * Get the derived public key for the current wallet
 * This allows checking if we're already in the game
 */
export const getDerivedPublicKey = async (
  walletAddress: string,
): Promise<string> => {
  if (!gameContractInstance) throw new Error("Contract not connected");

  try {
    // Get our secret key from private state
    const privateState = gameContractInstance.privateState as
      | GamePrivateState
      | undefined;

    if (!privateState) {
      throw new Error("Private state not initialized");
    }

    const secretKeyHex = privateState.secretKey;
    let secretKey: Uint8Array;

    // If secret key is not in private state, generate it
    if (!secretKeyHex) {
      console.warn(
        "⚠️ Secret key not found in private state, generating new one",
      );
      secretKey = generateSecretKeyFromWallet(walletAddress);
    } else {
      secretKey = hexToBytes(secretKeyHex);
    }

    // Derive our public key
    const derivedPublicKey = await derivePublicKey(secretKey);
    const derivedKeyHex = bytesToHex(derivedPublicKey);

    return derivedKeyHex;
  } catch (error) {
    console.error("❌ Failed to get derived public key:", error);
    throw error;
  }
};

/**
 * Helper: Convert hex string to Uint8Array
 */
export const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

/**
 * Helper: Convert Uint8Array to hex string
 */
export const bytesToHex = (bytes: Uint8Array): string => {
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
};

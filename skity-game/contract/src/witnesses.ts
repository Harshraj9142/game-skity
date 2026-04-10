/**
 * Witness functions for the FRAMED game contract.
 *
 * These run locally on the client — they access private state without
 * ever revealing it on-chain.  The private state shape (PS) holds:
 *   - role:            the player's assigned role (0=Citizen,1=Mafia,2=Doctor,3=Detective)
 *   - myVote:          the index of the player this user voted to eliminate
 *   - witnessedEvents: array of events (location + roundId) this user witnessed
 *
 * At deployment / join time the CLI passes an initialPrivateState object;
 * the witnesses below read from / write to that same object through the
 * WitnessContext that the Compact runtime supplies.
 */

import type { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import type {
  Ledger,
  WitnessEvent,
  Witnesses,
} from "./managed/game/contract/index.js";

/** Shape of the private state stored locally by each player. */
export interface GamePrivateState {
  /** Player's assigned secret key for key derivation (hex string). */
  readonly secretKey?: string;
  /** Player's assigned role: 0=Citizen 1=Mafia 2=Doctor 3=Detective */
  readonly role: number;
  /** Index of the player this user voted to eliminate (0-based). */
  readonly myVote: number;
  /** Events the player has personally witnessed. */
  readonly witnessedEvents: ReadonlyArray<{
    location: string;
    roundId: number;
  }>;
}

/**
 * Generate a deterministic secret key from wallet address
 * This ensures each wallet has a unique but consistent secret key
 * Note: This is synchronous to match the witness function signature
 */
function generateSecretKey(walletAddress?: string): Uint8Array {
  if (!walletAddress) {
    // Fallback to random key if no wallet address
    return crypto.getRandomValues(new Uint8Array(32));
  }

  // Create a deterministic key from wallet address
  const encoder = new TextEncoder();
  const data = encoder.encode(`framed-sk:${walletAddress}`);

  // Use a deterministic mixing function to generate 32 bytes
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    // Mix the input data with position-dependent values
    key[i] = data[i % data.length] ^ ((i * 7 + 13) & 0xff);
  }

  return key;
}

/**
 * Helper: Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export const witnesses: Witnesses<GamePrivateState> = {
  /**
   * Returns the player's local secret key (never revealed on-chain).
   * Generates a deterministic key each time - does not store in private state.
   */
  localSecretKey(
    context: WitnessContext<Ledger, GamePrivateState>,
  ): [GamePrivateState, Uint8Array] {
    console.log("🔑 localSecretKey witness called");

    // Check if secret key exists in private state
    const secretKeyHex = context.privateState.secretKey;
    let secretKey: Uint8Array;

    if (!secretKeyHex) {
      console.warn("   Secret key not in private state, generating random");
      secretKey = generateSecretKey();
    } else {
      console.log("   Using secret key from private state");
      secretKey = hexToBytes(secretKeyHex);
    }

    return [context.privateState, secretKey];
  },

  /**
   * Returns the player's assigned role as a bigint.
   * 0=Citizen 1=Mafia 2=Doctor 3=Detective
   */
  localRole(
    context: WitnessContext<Ledger, GamePrivateState>,
  ): [GamePrivateState, bigint] {
    console.log("👤 localRole witness called");
    console.log("   Role:", context.privateState.role);
    return [context.privateState, BigInt(context.privateState.role)];
  },

  /**
   * Returns the list of events this player has witnessed (up to 10).
   * The Compact Vector<10, WitnessEvent> requires exactly 10 elements.
   */
  localWitnessedEvents(
    context: WitnessContext<Ledger, GamePrivateState>,
  ): [GamePrivateState, WitnessEvent[]] {
    console.log("👁️ localWitnessedEvents witness called");

    const witnessedEvents = context.privateState.witnessedEvents || [];
    console.log("   Witnessed events count:", witnessedEvents.length);

    // Create an array of exactly 10 events
    // Fill with actual events first, then pad with empty events
    const events: WitnessEvent[] = [];

    for (let i = 0; i < 10; i++) {
      if (i < witnessedEvents.length) {
        // Use actual witnessed event
        events.push({
          location: hexToBytes(witnessedEvents[i].location),
          roundId: BigInt(witnessedEvents[i].roundId),
        });
      } else {
        // Pad with empty event (all zeros)
        events.push({
          location: new Uint8Array(16), // 16 bytes of zeros
          roundId: BigInt(0),
        });
      }
    }

    console.log("   Returning 10 events (padded)");
    return [context.privateState, events];
  },

  /**
   * Stores the vote target in private state.
   * The Compact circuit calls this after the on-chain nullifier is registered.
   */
  storeVoteTarget(
    context: WitnessContext<Ledger, GamePrivateState>,
    target: bigint,
  ): [GamePrivateState, []] {
    console.log("🗳️ storeVoteTarget witness called");
    console.log("   Target:", target);

    const newState: GamePrivateState = {
      ...context.privateState,
      myVote: Number(target),
    };
    return [newState, []];
  },
};

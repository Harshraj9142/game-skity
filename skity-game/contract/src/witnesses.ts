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

import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger, WitnessEvent, Witnesses } from './managed/game/contract/index.js';

/** Shape of the private state stored locally by each player. */
export interface GamePrivateState {
  /** Player's assigned role: 0=Citizen 1=Mafia 2=Doctor 3=Detective */
  readonly role: number;
  /** Index of the player this user voted to eliminate (0-based). */
  readonly myVote: number;
  /** Events the player has personally witnessed. */
  readonly witnessedEvents: ReadonlyArray<{ location: Uint8Array; roundId: number }>;
  /** Player's unique secret key (derived from wallet) */
  readonly secretKey?: Uint8Array;
}

/**
 * Generate a deterministic secret key from wallet address
 * This ensures each wallet has a unique but consistent secret key
 */
function generateSecretKey(walletAddress?: string): Uint8Array {
  if (!walletAddress) {
    // Fallback to random key if no wallet address
    return crypto.getRandomValues(new Uint8Array(32));
  }
  
  // Create a deterministic key from wallet address
  const encoder = new TextEncoder();
  const data = encoder.encode(`framed-sk:${walletAddress}`);
  
  // Use crypto.subtle to hash the wallet address
  // For now, use a simple approach - in production, use proper key derivation
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = data[i % data.length] ^ (i * 7); // Simple mixing
  }
  
  return key;
}

export const witnesses: Witnesses<GamePrivateState> = {
  /**
   * Returns the player's local secret key (never revealed on-chain).
   * Uses the secret key from private state, or generates one if not present.
   */
  localSecretKey(
    context: WitnessContext<Ledger, GamePrivateState>,
  ): [GamePrivateState, Uint8Array] {
    // Use stored secret key if available, otherwise generate a new one
    const secretKey = context.privateState.secretKey || generateSecretKey();
    
    // If we generated a new key, store it in private state
    if (!context.privateState.secretKey) {
      const newState: GamePrivateState = {
        ...context.privateState,
        secretKey,
      };
      return [newState, secretKey];
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
    return [context.privateState, BigInt(context.privateState.role)];
  },

  /**
   * Returns the list of events this player has witnessed (up to 10).
   * The Compact Vector<10, WitnessEvent> is satisfied by providing an array.
   */
  localWitnessedEvents(
    context: WitnessContext<Ledger, GamePrivateState>,
  ): [GamePrivateState, WitnessEvent[]] {
    const events: WitnessEvent[] = context.privateState.witnessedEvents.map((e) => ({
      location: e.location,
      roundId: BigInt(e.roundId),
    }));
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
    const newState: GamePrivateState = {
      ...context.privateState,
      myVote: Number(target),
    };
    return [newState, []];
  },
};

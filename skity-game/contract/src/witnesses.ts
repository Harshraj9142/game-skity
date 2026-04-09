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
}

/** A random 32-byte secret key generated once and stored in private state. */
const PLACEHOLDER_SK = new Uint8Array(32).fill(0x42);

export const witnesses: Witnesses<GamePrivateState> = {
  /**
   * Returns the player's local secret key (never revealed on-chain).
   * In a production client you'd derive this from the wallet seed.
   */
  localSecretKey(
    context: WitnessContext<Ledger, GamePrivateState>,
  ): [GamePrivateState, Uint8Array] {
    return [context.privateState, PLACEHOLDER_SK];
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

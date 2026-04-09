/* eslint-disable @typescript-eslint/no-explicit-any */
import { Contract } from '@framed/contract';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js/types';
import type { DeployedContract, FoundContract } from '@midnight-ntwrk/midnight-js/contracts';
import type { ProvableCircuitId } from '@midnight-ntwrk/compact-js';

/** Private state stored locally by each player (never revealed on-chain). */
export interface GamePrivateState {
  /** Assigned role: 0=Citizen 1=Mafia 2=Doctor 3=Detective */
  readonly role: number;
  /** Index of the player this user voted to eliminate. */
  readonly myVote: number;
  /** Events the player personally witnessed. */
  readonly witnessedEvents: ReadonlyArray<{ location: Uint8Array; roundId: number }>;
}

// Bypass constraint checks
export type GameCircuits = any;

export const GamePrivateStateId = 'gamePrivateState';

export type GameProviders = MidnightProviders<GameCircuits, typeof GamePrivateStateId, GamePrivateState>;

export type GameContract = any;

export type DeployedGameContract = any;

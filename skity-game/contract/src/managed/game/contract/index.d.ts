import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum GamePhase { waitingForPlayers = 0,
                        night = 1,
                        voting = 2,
                        thresholdReveal = 3,
                        roundComplete = 4
}

export type PlayerRecord = { isAlive: boolean;
                             hasActed: boolean;
                             hasVoted: boolean;
                             roleCommitment: Uint8Array
                           };

export type AlertRecord = { location: Uint8Array; roundId: bigint };

export type WitnessEvent = { location: Uint8Array; roundId: bigint };

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  localRole(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  localWitnessedEvents(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, WitnessEvent[]];
  storeVoteTarget(context: __compactRuntime.WitnessContext<Ledger, PS>,
                  target_0: bigint): [PS, []];
}

export type ImpureCircuits<PS> = {
  joinGame(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  initGame(context: __compactRuntime.CircuitContext<PS>,
           roleAssignments_0: bigint[]): __compactRuntime.CircuitResults<PS, []>;
  castPrivateVote(context: __compactRuntime.CircuitContext<PS>,
                  targetId_0: bigint,
                  roundSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revealTally(context: __compactRuntime.CircuitContext<PS>,
              moderatorSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  completeReveal(context: __compactRuntime.CircuitContext<PS>,
                 eliminated_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  blowWhistle(context: __compactRuntime.CircuitContext<PS>,
              event_0: WitnessEvent): __compactRuntime.CircuitResults<PS, []>;
  triggerSabotage(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  deactivateSabotage(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  takeAction(context: __compactRuntime.CircuitContext<PS>, targetId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  advanceToVoting(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  startNewRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  getPlayerStatus(context: __compactRuntime.CircuitContext<PS>,
                  playerAddr_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  joinGame(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  initGame(context: __compactRuntime.CircuitContext<PS>,
           roleAssignments_0: bigint[]): __compactRuntime.CircuitResults<PS, []>;
  castPrivateVote(context: __compactRuntime.CircuitContext<PS>,
                  targetId_0: bigint,
                  roundSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revealTally(context: __compactRuntime.CircuitContext<PS>,
              moderatorSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  completeReveal(context: __compactRuntime.CircuitContext<PS>,
                 eliminated_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  blowWhistle(context: __compactRuntime.CircuitContext<PS>,
              event_0: WitnessEvent): __compactRuntime.CircuitResults<PS, []>;
  triggerSabotage(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  deactivateSabotage(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  takeAction(context: __compactRuntime.CircuitContext<PS>, targetId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  advanceToVoting(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  startNewRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  getPlayerStatus(context: __compactRuntime.CircuitContext<PS>,
                  playerAddr_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  joinGame(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  initGame(context: __compactRuntime.CircuitContext<PS>,
           roleAssignments_0: bigint[]): __compactRuntime.CircuitResults<PS, []>;
  castPrivateVote(context: __compactRuntime.CircuitContext<PS>,
                  targetId_0: bigint,
                  roundSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revealTally(context: __compactRuntime.CircuitContext<PS>,
              moderatorSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  completeReveal(context: __compactRuntime.CircuitContext<PS>,
                 eliminated_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  blowWhistle(context: __compactRuntime.CircuitContext<PS>,
              event_0: WitnessEvent): __compactRuntime.CircuitResults<PS, []>;
  triggerSabotage(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  deactivateSabotage(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  takeAction(context: __compactRuntime.CircuitContext<PS>, targetId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  advanceToVoting(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  startNewRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  getPlayerStatus(context: __compactRuntime.CircuitContext<PS>,
                  playerAddr_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly gamePhase: bigint;
  readonly playerCount: bigint;
  readonly maxPlayers: bigint;
  readonly roundCounter: bigint;
  readonly moderatorCommitment: Uint8Array;
  readonly tallyHash: Uint8Array;
  voteNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  readonly votingHidden: boolean;
  readonly sabotageActive: boolean;
  readonly sabotageExpiry: bigint;
  readonly sabotageUsed: boolean;
  readonly alertCount: bigint;
  alerts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): AlertRecord;
    [Symbol.iterator](): Iterator<[bigint, AlertRecord]>
  };
  players: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): PlayerRecord;
    [Symbol.iterator](): Iterator<[Uint8Array, PlayerRecord]>
  };
  playerAddresses: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Uint8Array;
    [Symbol.iterator](): Iterator<[bigint, Uint8Array]>
  };
  readonly eliminatedPlayer: Uint8Array;
  readonly killedPlayerId: bigint;
  readonly playerKillCount: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               creator_0: Uint8Array,
               maxP_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;

export enum ClientState {
  Tutorial = "tutorial",
  InGame = "inGame",
}

// Synced with Compact contract GamePhase enum
export enum GamePhase {
  WaitingForPlayers = 0,    // waitingForPlayers
  Night = 1,                 // night (was AwaitPlayerActions)
  Voting = 2,                // voting
  ThresholdReveal = 3,       // thresholdReveal (countdown before reveal)
  RoundComplete = 4,         // roundComplete
}

// Synced with Compact contract roles: 0=Citizen, 1=Mafia, 2=Doctor, 3=Detective
export enum PlayerRole {
  Citizen = 0,
  Mafia = 1,      // was Thief
  Doctor = 2,
  Detective = 3,
  Unknown = 99,   // Not yet assigned
}

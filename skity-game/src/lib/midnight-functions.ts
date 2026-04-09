/**
 * Midnight Network Integration Functions
 * Handles all interactions with the Compact smart contract
 */

import { Contract, ledger, witnesses, type GamePrivateState } from '@framed/contract';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { MidnightGameProviders } from '../context/WalletContext';

// Set network ID - change to 'preprod' for testnet or 'undeployed' for local
setNetworkId('preprod');

// Type for the deployed game contract
type DeployedGameContract = any; // Using any for now due to complex type inference

// Pre-compile the game contract with ZK circuit assets and witnesses
const gameCompiledContract = CompiledContract.make('game', Contract).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets('/zk-keys'),
);

// Singleton contract instance
let gameContractInstance: DeployedGameContract | null = null;
let currentProviders: MidnightGameProviders | null = null;

/**
 * Initialize connection to an existing game contract
 */
export const connectToGame = async (
  contractAddress: string,
  providers: MidnightGameProviders,
  initialPrivateState?: GamePrivateState
): Promise<void> => {
  console.log('🔗 Connecting to game contract:', contractAddress);
  
  try {
    currentProviders = providers;
    
    // Default private state for new players
    const privateState: GamePrivateState = initialPrivateState || {
      role: 99, // Unknown until assigned
      myVote: 0,
      witnessedEvents: [],
    };
    
    // Find and connect to the deployed contract
    gameContractInstance = await findDeployedContract(
      providers as any,
      {
        contractAddress,
        compiledContract: gameCompiledContract,
        privateStateId: 'gamePrivateState',
        initialPrivateState: privateState
      }
    ) as any;
    
    console.log('✅ Connected to game contract');
  } catch (error) {
    console.error('❌ Failed to connect to contract:', error);
    throw error;
  }
};

/**
 * Join the game lobby
 */
export const joinGame = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('🎮 Joining game...');
  
  try {
    const result = await gameContractInstance.callTx.joinGame();
    console.log('✅ Joined game successfully');
    return result;
  } catch (error) {
    console.error('❌ Failed to join game:', error);
    throw error;
  }
};

/**
 * Initialize game and assign roles (host only)
 */
export const initGame = async (roleAssignments: number[], myRole: number): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('🎲 Initializing game with roles:', roleAssignments);
  
  try {
    // Update private state with assigned role
    gameContractInstance.privateState = {
      ...gameContractInstance.privateState,
      role: myRole,
    };
    
    const roles = roleAssignments.map(r => BigInt(r));
    const result = await gameContractInstance.callTx.initGame(roles);
    console.log('✅ Game initialized successfully');
    return result;
  } catch (error) {
    console.error('❌ Failed to initialize game:', error);
    throw error;
  }
};

/**
 * Cast a private vote during voting phase
 */
export const castPrivateVote = async (targetId: number): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('🗳️ Casting vote for player:', targetId);
  
  try {
    // Generate random salt for vote privacy
    const roundSalt = crypto.getRandomValues(new Uint8Array(32));
    const result = await gameContractInstance.callTx.castPrivateVote(BigInt(targetId), roundSalt);
    console.log('✅ Vote cast successfully');
    return result;
  } catch (error) {
    console.error('❌ Failed to cast vote:', error);
    throw error;
  }
};

/**
 * Take action during night phase (kill/save/investigate)
 */
export const takeAction = async (targetId: number): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('🌙 Taking action on player:', targetId);
  
  try {
    const result = await gameContractInstance.callTx.takeAction(BigInt(targetId));
    console.log('✅ Action taken successfully');
    return result;
  } catch (error) {
    console.error('❌ Failed to take action:', error);
    throw error;
  }
};

/**
 * Blow whistle - anonymous alert about suspicious activity
 */
export const blowWhistle = async (suspectId: number, roundId: number): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('📢 Blowing whistle on player:', suspectId);
  
  try {
    // Encode suspect ID in location bytes
    const locationBytes = new Uint8Array(16);
    locationBytes[0] = suspectId & 0xff;
    
    const event = { 
      location: locationBytes, 
      roundId: BigInt(roundId) 
    };
    
    const result = await gameContractInstance.callTx.blowWhistle(event);
    console.log('✅ Whistle blown successfully');
    return result;
  } catch (error) {
    console.error('❌ Failed to blow whistle:', error);
    throw error;
  }
};

/**
 * Trigger sabotage - Mafia ability to black out voting
 */
export const triggerSabotage = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('💣 Triggering sabotage...');
  
  try {
    const result = await gameContractInstance.callTx.triggerSabotage();
    console.log('✅ Sabotage triggered successfully');
    return result;
  } catch (error) {
    console.error('❌ Failed to trigger sabotage:', error);
    throw error;
  }
};

/**
 * Deactivate sabotage (auto or manual)
 */
export const deactivateSabotage = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('🔆 Deactivating sabotage...');
  
  try {
    const result = await gameContractInstance.callTx.deactivateSabotage();
    console.log('✅ Sabotage deactivated successfully');
    return result;
  } catch (error) {
    console.error('❌ Failed to deactivate sabotage:', error);
    throw error;
  }
};

/**
 * View your own role from private state
 */
export const viewOwnRole = async (): Promise<number> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('👁️ Viewing own role...');
  
  try {
    // Access role directly from private state
    const privateState = gameContractInstance.privateState;
    const roleNumber = privateState.role;
    console.log('✅ Role retrieved:', roleNumber);
    return roleNumber;
  } catch (error) {
    console.error('❌ Failed to view role:', error);
    throw error;
  }
};

/**
 * Advance to voting phase (moderator only)
 */
export const advanceToVoting = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('⏭️ Advancing to voting phase...');
  
  try {
    const result = await gameContractInstance.callTx.advanceToVoting();
    console.log('✅ Advanced to voting phase');
    return result;
  } catch (error) {
    console.error('❌ Failed to advance to voting:', error);
    throw error;
  }
};

/**
 * Start new round (moderator only)
 */
export const startNewRound = async (): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('🔄 Starting new round...');
  
  try {
    const result = await gameContractInstance.callTx.startNewRound();
    console.log('✅ New round started');
    return result;
  } catch (error) {
    console.error('❌ Failed to start new round:', error);
    throw error;
  }
};

/**
 * Reveal vote tally (moderator only)
 */
export const revealTally = async (moderatorSecret: Uint8Array): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('🔓 Revealing tally...');
  
  try {
    const result = await gameContractInstance.callTx.revealTally(moderatorSecret);
    console.log('✅ Tally revealed');
    return result;
  } catch (error) {
    console.error('❌ Failed to reveal tally:', error);
    throw error;
  }
};

/**
 * Complete reveal and eliminate player (moderator only)
 */
export const completeReveal = async (eliminatedPlayerAddress: Uint8Array): Promise<void> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  console.log('⚰️ Completing reveal and eliminating player...');
  
  try {
    const result = await gameContractInstance.callTx.completeReveal(eliminatedPlayerAddress);
    console.log('✅ Reveal completed');
    return result;
  } catch (error) {
    console.error('❌ Failed to complete reveal:', error);
    throw error;
  }
};

/**
 * Get game state from ledger
 */
export const getGameState = async () => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  if (!currentProviders) throw new Error('Providers not initialized');
  
  try {
    // Query the current contract state from the indexer
    const contractAddress = gameContractInstance.deployTxData.public.contractAddress;
    const currentState = await currentProviders.publicDataProvider.queryContractState(contractAddress);
    
    if (!currentState) {
      console.warn('No contract state found, using initial state');
      const initialState = gameContractInstance.deployTxData.public.initialContractState;
      return ledger(initialState.data);
    }
    
    const ledgerState = ledger(currentState.data);
    return ledgerState;
  } catch (error) {
    console.error('❌ Failed to get game state:', error);
    throw error;
  }
};

/**
 * Get player status
 */
export const getPlayerStatus = async (playerAddress: Uint8Array): Promise<boolean> => {
  if (!gameContractInstance) throw new Error('Contract not connected');
  
  try {
    const status = await gameContractInstance.callTx.getPlayerStatus(playerAddress);
    return status;
  } catch (error) {
    console.error('❌ Failed to get player status:', error);
    throw error;
  }
};

/**
 * Helper: Convert hex string to Uint8Array
 */
export const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
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
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

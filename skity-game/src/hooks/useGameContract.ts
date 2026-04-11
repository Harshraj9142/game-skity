/**
 * Custom hook for interacting with the game contract
 * Provides easy access to all contract functions with wallet integration
 */

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import * as midnight from '../lib/midnight-functions';
import { ledger } from '@framed/contract';

// Get the return type of the ledger function
type LedgerState = ReturnType<typeof ledger>;

export const useGameContract = (contractAddress?: string) => {
  const { isConnected, providers, walletAddress } = useWallet();
  const [isContractConnected, setIsContractConnected] = useState(false);
  const [gameState, setGameState] = useState<LedgerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to contract when wallet is connected and address is provided
  useEffect(() => {
    if (isConnected && providers && contractAddress && walletAddress && !isContractConnected) {
      connectContract();
    }
  }, [isConnected, providers, contractAddress, walletAddress, isContractConnected]);

  const refreshGameState = useCallback(async () => {
    try {
      const state = await midnight.getGameState();
      setGameState(state);
      return state;
    } catch (err) {
      console.error('Failed to refresh game state:', err);
      return null;
    }
  }, []);

  const connectContract = useCallback(async () => {
    if (!providers || !contractAddress || !walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await midnight.connectToGame(contractAddress, providers, walletAddress);
      setIsContractConnected(true);
      
      // Get and store our derived key
      try {
        const derivedKey = await midnight.getDerivedPublicKey(walletAddress);
        const storageKey = `player-key:${contractAddress}:${walletAddress}`;
        
        // Check if we already have a stored key
        const existingKey = localStorage.getItem(storageKey);
        if (!existingKey) {
          localStorage.setItem(storageKey, derivedKey);
          console.log('💾 Stored derived key on connection:', derivedKey);
        } else {
          console.log('🔑 Found existing derived key:', existingKey);
          // Verify they match
          if (existingKey.toLowerCase() !== derivedKey.toLowerCase()) {
            console.warn('⚠️ Stored key does not match derived key!');
            localStorage.setItem(storageKey, derivedKey);
          }
        }
      } catch (keyError) {
        console.warn('⚠️ Could not get derived key on connection:', keyError);
        // Continue anyway - key will be generated when joining
      }
      
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to contract';
      setError(message);
      console.error('Contract connection error:', err);
    } finally {
      setLoading(false);
    }
  }, [providers, contractAddress, walletAddress, refreshGameState]);

  // Wrapped contract functions that auto-refresh state
  const joinGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!walletAddress) throw new Error('Wallet address not available');
      
      console.log('🎮 Starting joinGame transaction...');
      const derivedKey = await midnight.joinGame(walletAddress);
      
      // Store the derived key in localStorage for this wallet
      if (contractAddress) {
        const storageKey = `player-key:${contractAddress}:${walletAddress}`;
        localStorage.setItem(storageKey, derivedKey);
        console.log('💾 Stored derived key for wallet:', walletAddress);
        console.log('🔑 Derived key:', derivedKey);
      }
      
      console.log('✅ Transaction submitted successfully!');
      console.log('⏳ Waiting for transaction to be indexed (this can take 30-60 seconds)...');
      
      // Wait longer for the transaction to be indexed on Preprod
      // Preprod network has ~20 second block times
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('🔄 Refreshing game state...');
      
      // Try to refresh state, but don't fail if it's not ready yet
      try {
        await refreshGameState();
        console.log('✅ Game state refreshed successfully');
      } catch (refreshError) {
        console.warn('⚠️ Could not refresh game state immediately:', refreshError);
        console.log('💡 The transaction may still be processing. Try refreshing in a moment.');
        // Don't throw - the transaction was submitted successfully
      }
      
      return derivedKey;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join game';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState, walletAddress, contractAddress]);

  const initGame = useCallback(async (roleAssignments: number[], myRole: number) => {
    setLoading(true);
    setError(null);
    try {
      await midnight.initGame(roleAssignments, myRole);
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize game';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const castVote = useCallback(async (targetId: number) => {
    setLoading(true);
    setError(null);
    try {
      await midnight.castPrivateVote(targetId);
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cast vote';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const takeAction = useCallback(async (targetId: number) => {
    setLoading(true);
    setError(null);
    try {
      await midnight.takeAction(targetId);
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to take action';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const blowWhistle = useCallback(async (suspectId: number, roundId: number) => {
    setLoading(true);
    setError(null);
    try {
      await midnight.blowWhistle(suspectId, roundId);
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to blow whistle';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const triggerSabotage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await midnight.triggerSabotage();
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to trigger sabotage';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const deactivateSabotage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await midnight.deactivateSabotage();
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate sabotage';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const viewRole = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const role = await midnight.viewOwnRole();
      return role;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to view role';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const advanceToVoting = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await midnight.advanceToVoting();
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to advance to voting';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const startNewRound = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await midnight.startNewRound();
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start new round';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const revealTally = useCallback(async (moderatorSecret: Uint8Array) => {
    setLoading(true);
    setError(null);
    try {
      await midnight.revealTally(moderatorSecret);
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reveal tally';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  const completeReveal = useCallback(async (eliminatedPlayerAddress: Uint8Array) => {
    setLoading(true);
    setError(null);
    try {
      await midnight.completeReveal(eliminatedPlayerAddress);
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete reveal';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

  return {
    // State
    isContractConnected,
    gameState,
    loading,
    error,
    
    // Actions
    connectContract,
    refreshGameState,
    joinGame,
    initGame,
    castVote,
    takeAction,
    blowWhistle,
    triggerSabotage,
    deactivateSabotage,
    viewRole,
    advanceToVoting,
    startNewRound,
    revealTally,
    completeReveal,
  };
};

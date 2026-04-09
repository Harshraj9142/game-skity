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
  const { isConnected, providers } = useWallet();
  const [isContractConnected, setIsContractConnected] = useState(false);
  const [gameState, setGameState] = useState<LedgerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to contract when wallet is connected and address is provided
  useEffect(() => {
    if (isConnected && providers && contractAddress && !isContractConnected) {
      connectContract();
    }
  }, [isConnected, providers, contractAddress, isContractConnected]);

  const connectContract = useCallback(async () => {
    if (!providers || !contractAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await midnight.connectToGame(contractAddress, providers);
      setIsContractConnected(true);
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to contract';
      setError(message);
      console.error('Contract connection error:', err);
    } finally {
      setLoading(false);
    }
  }, [providers, contractAddress]);

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

  // Wrapped contract functions that auto-refresh state
  const joinGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await midnight.joinGame();
      await refreshGameState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join game';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshGameState]);

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

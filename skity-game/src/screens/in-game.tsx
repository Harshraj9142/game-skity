import { Button } from "@/components/ui/button";
import * as Typography from "@/components/ui/typography";
import React, { useState, useEffect, SetStateAction, Dispatch } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { GamePhase, PlayerRole } from "@/types";
import { useWallet } from "@/context/WalletContext";
import { useGameContract } from "@/hooks/useGameContract";
import { ChatContext } from "../context/ChatContext";
import SidePanel from "@/components/side-panel";

// Phase Components
import { WaitingRoom } from "./in-game/WaitingRoom";
import { NightPhase } from "./in-game/NightPhase";
import { VotingPhase } from "./in-game/VotingPhase";
import { RevealPhase } from "./in-game/RevealPhase";
import { PhaseIndicator } from "./in-game/components/PhaseIndicator";
import { AlertsList } from "./in-game/components/AlertsList";

// Effects
import { ConfettiEffect } from "@/components/effects/ConfettiEffect";
import { showToast, ToastProvider } from "@/components/effects/ToastNotifications";
import { GameLoadingSkeleton } from "@/components/effects/LoadingSkeleton";

export const PLAYER_NAMES = ["Soup Enjoyer", "Pineapple Guy", "Zippy", "Dizzy Dan"];

export interface Player {
  action: boolean;
  id: string;
  alive: boolean;
  position: number;
  vote: boolean;
  address: Uint8Array;
}

const InGameScreen = ({
  gameContract,
  setGameContract,
}: {
  gameContract: string;
  setGameContract: Dispatch<SetStateAction<string>>;
}) => {
  const { isConnected, shieldedAddress } = useWallet();
  const { chatsOpenState } = React.useContext(ChatContext);
  
  // Use the game contract hook
  const {
    isContractConnected,
    gameState,
    loading: contractLoading,
    error: contractError,
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
    refreshGameState,
  } = useGameContract(gameContract);

  const [playerRole, setPlayerRole] = useState<PlayerRole>(PlayerRole.Unknown);
  const [loadingButtons, setLoadingButtons] = useState<boolean>(false);

  // Poll contract state every 3 seconds
  useEffect(() => {
    if (!isContractConnected) return;
    
    const interval = setInterval(() => {
      refreshGameState();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isContractConnected, refreshGameState]);

  // Extract data from contract state
  const gamePhase = gameState ? Number(gameState.gamePhase) : GamePhase.WaitingForPlayers;
  const currentRound = gameState ? Number(gameState.roundCounter) : 1;
  const sabotageActive = gameState?.sabotageActive || false;
  const sabotageUsed = gameState?.sabotageUsed || false;
  const playerCount = gameState ? Number(gameState.playerCount) : 0;
  const maxPlayers = gameState ? Number(gameState.maxPlayers) : 4;

  // Convert contract players Map to array
  const players: Player[] = [];
  if (gameState?.players) {
    let index = 0;
    for (const [address, record] of gameState.players) {
      players.push({
        id: bytesToHex(address),
        address: address,
        alive: record.isAlive,
        action: record.hasActed,
        vote: record.hasVoted,
        position: index,
      });
      index++;
    }
  }

  // Convert alerts Map to array
  const alerts: Array<{ id: number; location: number; roundId: number }> = [];
  if (gameState?.alerts) {
    for (const [id, alert] of gameState.alerts) {
      alerts.push({
        id: Number(id),
        location: alert.location[0], // First byte is player ID
        roundId: Number(alert.roundId),
      });
    }
  }

  // Check if current user is in the game
  const playerIsJoined = players.some((p) => p.id.toLowerCase() === shieldedAddress?.toLowerCase());
  const currentPlayer = players.find((p) => p.id.toLowerCase() === shieldedAddress?.toLowerCase());
  const playerHasAction = currentPlayer?.action || false;
  const playerHasVoted = currentPlayer?.vote || false;
  const playerId = currentPlayer?.position.toString() || null;

  const roomId = gameContract.slice(0, 8);
  const isChatOpen = chatsOpenState[roomId];
  const gameStyle = isChatOpen
    ? "w-11/12 h-11/12 sm:h-auto sm:w-2/3 transition-all duration-300"
    : "w-11/12 h-11/12 sm:w-full sm:h-auto mt-20 sm:mt-0 transition-all duration-300";

  // Handler functions
  const handleJoinGame = async () => {
    setLoadingButtons(true);
    try {
      await joinGame();
      ConfettiEffect.playerJoined();
      showToast.playerJoined("Player");
    } catch (error) {
      console.error("Failed to join game:", error);
      showToast.error("Failed to join game");
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleInitGame = async () => {
    setLoadingButtons(true);
    try {
      // Randomize roles: 0=Citizen, 1=Mafia, 2=Doctor, 3=Detective
      const roles = [0, 1, 2, 3];
      const shuffled = roles.sort(() => Math.random() - 0.5);
      
      // Determine my role (host is player 0)
      const myRole = shuffled[0];
      
      await initGame(shuffled, myRole);
      setPlayerRole(myRole as PlayerRole);
      ConfettiEffect.gameStart();
      showToast.gameStarted();
    } catch (error) {
      console.error("Failed to init game:", error);
      showToast.error("Failed to start game");
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleTakeAction = async (targetId: number) => {
    if (playerHasAction) return;
    setLoadingButtons(true);
    try {
      await takeAction(targetId);
      showToast.actionTaken();
    } catch (error) {
      console.error("Failed to take action:", error);
      showToast.error("Failed to take action");
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleCastVote = async (targetId: number) => {
    setLoadingButtons(true);
    try {
      await castVote(targetId);
      ConfettiEffect.voteCast();
      showToast.voteCast();
    } catch (error) {
      console.error("Failed to cast vote:", error);
      showToast.error("Failed to cast vote");
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleBlowWhistle = async (suspectId: number) => {
    setLoadingButtons(true);
    try {
      await blowWhistle(suspectId, currentRound);
      ConfettiEffect.whistleBlow();
      showToast.whistleBlown();
    } catch (error) {
      console.error("Failed to blow whistle:", error);
      showToast.error("Failed to send alert");
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleTriggerSabotage = async () => {
    setLoadingButtons(true);
    try {
      await triggerSabotage();
      ConfettiEffect.sabotage();
      showToast.sabotageActivated();
    } catch (error) {
      console.error("Failed to trigger sabotage:", error);
      showToast.error("Failed to trigger sabotage");
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleSabotageExpire = async () => {
    try {
      await deactivateSabotage();
    } catch (error) {
      console.error("Failed to deactivate sabotage:", error);
    }
  };

  const handleViewRole = async () => {
    setLoadingButtons(true);
    try {
      const role = await viewRole();
      setPlayerRole(role as PlayerRole);
      const roleNames = ["Citizen", "Mafia", "Doctor", "Detective"];
      showToast.roleRevealed(roleNames[role] || "Unknown");
    } catch (error) {
      console.error("Failed to view role:", error);
      showToast.error("Failed to reveal role");
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleStartNewRound = async () => {
    setLoadingButtons(true);
    try {
      await startNewRound();
    } catch (error) {
      console.error("Failed to start new round:", error);
      showToast.error("Failed to start new round");
    } finally {
      setLoadingButtons(false);
    }
  };

  const handleAdvanceToVoting = async () => {
    setLoadingButtons(true);
    try {
      await advanceToVoting();
    } catch (error) {
      console.error("Failed to advance to voting:", error);
      showToast.error("Failed to advance phase");
    } finally {
      setLoadingButtons(false);
    }
  };

  // Show wallet connection prompt
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Typography.TypographyH2>Connect Your Wallet</Typography.TypographyH2>
        <Typography.TypographyP>
          Please connect your Lace wallet to join the game
        </Typography.TypographyP>
      </div>
    );
  }

  // Show loading while connecting to contract
  if (!isContractConnected || contractLoading) {
    return <GameLoadingSkeleton />;
  }

  // Show error if contract connection failed
  if (contractError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Typography.TypographyH2>Connection Error</Typography.TypographyH2>
        <Typography.TypographyP className="text-red-500">
          {contractError}
        </Typography.TypographyP>
        <Button onClick={() => setGameContract("")}>Back to Lobby</Button>
      </div>
    );
  }

  return (
    <>
      <ToastProvider />
      <div className={gameStyle}>
        <ErrorBoundary fallback={<p>there was an error. please try again.</p>}>
          {/* Header */}
          <div className="w-full flex flex-row justify-center items-center gap-3 mb-6">
            <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              Room id: <span className="font-bold">{roomId}</span>
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Players: {playerCount}/{maxPlayers}
            </p>
            <Button
              disabled={loadingButtons}
              variant="outline"
              size="sm"
              onClick={() => setGameContract("")}
            >
              Exit room
            </Button>
          </div>

          {/* Phase Indicator */}
          {gamePhase !== GamePhase.WaitingForPlayers && (
            <PhaseIndicator phase={gamePhase} roundNumber={currentRound} />
          )}

          {/* Alerts List */}
          <AlertsList alerts={alerts} />

          {/* Phase-Specific Content */}
          {gamePhase === GamePhase.WaitingForPlayers && (
            <WaitingRoom
              players={players}
              roomId={roomId}
              playerIsJoined={playerIsJoined}
              onJoinGame={handleJoinGame}
              onInitGame={handleInitGame}
              isLoading={loadingButtons}
            />
          )}

          {gamePhase === GamePhase.Night && (
            <NightPhase
              players={players}
              playerRole={playerRole}
              playerHasActed={playerHasAction}
              currentRound={currentRound}
              onTakeAction={handleTakeAction}
              onBlowWhistle={handleBlowWhistle}
              onViewRole={handleViewRole}
              isLoading={loadingButtons}
            />
          )}

          {gamePhase === GamePhase.Voting && (
            <VotingPhase
              players={players}
              playerRole={playerRole}
              playerHasVoted={playerHasVoted}
              sabotageActive={sabotageActive}
              sabotageUsed={sabotageUsed}
              onCastVote={handleCastVote}
              onTriggerSabotage={handleTriggerSabotage}
              onSabotageExpire={handleSabotageExpire}
              isLoading={loadingButtons}
            />
          )}

          {gamePhase === GamePhase.ThresholdReveal && (
            <div className="text-center py-12">
              <Typography.TypographyH2>Revealing Results...</Typography.TypographyH2>
              <Typography.TypographyP className="mt-4">
                Counting votes and determining elimination
              </Typography.TypographyP>
            </div>
          )}

          {gamePhase === GamePhase.RoundComplete && (
            <RevealPhase
              players={players}
              eliminatedPlayer={gameState?.eliminatedPlayer ? bytesToHex(gameState.eliminatedPlayer) : null}
              onStartNewRound={handleStartNewRound}
              isLoading={loadingButtons}
            />
          )}

          {playerIsJoined && playerId && (
            <SidePanel roomId={roomId} player_id={playerId} hasJoined={playerIsJoined} />
          )}
        </ErrorBoundary>
      </div>
    </>
  );
};

// Helper: Convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default InGameScreen;

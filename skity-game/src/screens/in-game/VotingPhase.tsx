import * as Typography from "@/components/ui/typography";
import { motion } from "framer-motion";
import { ClickablePlayerCard } from "@/components/player-cards";
import { SabotageButton } from "./components/SabotageButton";
import { SabotageOverlay } from "./components/SabotageOverlay";
import { CountdownTimer } from "@/components/CountdownTimer";
import { VoteProgressBar } from "@/components/VoteProgressBar";
import { Player } from "@/screens/in-game";
import { PlayerRole } from "@/types";

interface VotingPhaseProps {
  players: Player[];
  playerRole: PlayerRole;
  playerHasVoted: boolean;
  sabotageActive: boolean;
  sabotageUsed: boolean;
  onCastVote: (targetId: number) => Promise<void>;
  onTriggerSabotage: () => Promise<void>;
  onSabotageExpire: () => void;
  isLoading: boolean;
}

export const VotingPhase = ({
  players,
  playerRole,
  playerHasVoted,
  sabotageActive,
  sabotageUsed,
  onCastVote,
  onTriggerSabotage,
  onSabotageExpire,
  isLoading,
}: VotingPhaseProps) => {
  const votedCount = players.filter((p) => p.vote).length;
  const totalPlayers = players.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Sabotage Overlay */}
      <SabotageOverlay
        isActive={sabotageActive}
        duration={30}
        onExpire={onSabotageExpire}
      />

      {/* Countdown Timer */}
      {!sabotageActive && (
        <CountdownTimer
          duration={90}
          label="Voting Phase"
          phase="voting"
          onComplete={() => console.log("Voting phase ended")}
        />
      )}

      {/* Vote Progress Bar */}
      {!sabotageActive && <VoteProgressBar votedCount={votedCount} totalPlayers={totalPlayers} />}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl block mb-3"
          >
            🗳️
          </motion.span>
          <Typography.TypographyH3 className="border-0 mb-2">
            Voting Phase
          </Typography.TypographyH3>
          <Typography.TypographyP className="text-gray-600 m-0">
            Discuss and vote for who you think the Mafia is
          </Typography.TypographyP>
        </div>
      </motion.div>

      {/* Status Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        {playerHasVoted ? (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
            <Typography.TypographyP className="text-green-700 font-semibold m-0">
              ✓ Vote cast successfully. Waiting for others...
            </Typography.TypographyP>
            <Typography.TypographyXSmall className="text-green-600 mt-1">
              Your vote is encrypted and will be revealed after everyone votes
            </Typography.TypographyXSmall>
          </div>
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
            <Typography.TypographyP className="text-yellow-700 font-semibold m-0">
              ⏳ Cast your vote below
            </Typography.TypographyP>
            <Typography.TypographyXSmall className="text-yellow-600 mt-1">
              🔒 Your vote is private and secured with zero-knowledge proofs
            </Typography.TypographyXSmall>
          </div>
        )}
      </motion.div>

      {/* Sabotage Button (Mafia Only) */}
      {playerRole === PlayerRole.Mafia && !playerHasVoted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <SabotageButton
            onTrigger={onTriggerSabotage}
            disabled={isLoading || sabotageActive}
            sabotageUsed={sabotageUsed}
          />
        </motion.div>
      )}

      {/* Player Cards */}
      {!playerHasVoted && !sabotageActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-row gap-4 items-center justify-center flex-wrap"
        >
          {players.map((player, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <ClickablePlayerCard
                player={player}
                index={i}
                gamePhase={2} // Voting phase
                onClick={() => onCastVote(i)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 max-w-md mx-auto"
      >
        <Typography.TypographySmall className="text-blue-800">
          💡 <strong>Secret Ballots:</strong> Your vote is encrypted using zero-knowledge proofs. 
          No one can see who you voted for until the reveal phase.
        </Typography.TypographySmall>
      </motion.div>
    </motion.div>
  );
};

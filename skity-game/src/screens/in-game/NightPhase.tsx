import { Button } from "@/components/ui/button";
import * as Typography from "@/components/ui/typography";
import { motion } from "framer-motion";
import { ClickablePlayerCard } from "@/components/player-cards";
import { WhistleblowerButton } from "./components/WhistleblowerButton";
import { CountdownTimer } from "@/components/CountdownTimer";
import { RoleRevealAnimation } from "@/components/effects/RoleRevealAnimation";
import { Player } from "@/screens/in-game";
import { PlayerRole } from "@/types";

interface NightPhaseProps {
  players: Player[];
  playerRole: PlayerRole;
  playerHasActed: boolean;
  currentRound: number;
  onTakeAction: (targetId: number) => Promise<void>;
  onBlowWhistle: (suspectId: number) => Promise<void>;
  onViewRole: () => Promise<void>;
  isLoading: boolean;
}

const roleInstructions = {
  [PlayerRole.Unknown]: {
    title: "Reveal Your Role",
    description: "Click below to see your secret role for this game",
    icon: "❓",
  },
  [PlayerRole.Mafia]: {
    title: "You are the Mafia 🥷",
    description: "Choose a player to eliminate. Try to blend in and avoid suspicion.",
    icon: "🥷",
  },
  [PlayerRole.Detective]: {
    title: "You are the Detective 🕵️",
    description: "Investigate a player to discover if they're the Mafia.",
    icon: "🕵️",
  },
  [PlayerRole.Doctor]: {
    title: "You are the Doctor 👨‍⚕️",
    description: "Choose a player to protect from elimination tonight.",
    icon: "👨‍⚕️",
  },
  [PlayerRole.Citizen]: {
    title: "You are a Citizen 👤",
    description: "You have no special abilities. Pay attention and vote wisely!",
    icon: "👤",
  },
};

export const NightPhase = ({
  players,
  playerRole,
  playerHasActed,
  currentRound,
  onTakeAction,
  onBlowWhistle,
  onViewRole,
  isLoading,
}: NightPhaseProps) => {
  const roleConfig = roleInstructions[playerRole];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Role Reveal Animation */}
      {playerRole === PlayerRole.Unknown ? (
        <RoleRevealAnimation
          onReveal={onViewRole}
          revealedRole={playerRole}
          isRevealing={isLoading}
        />
      ) : (
        <>
          {/* Countdown Timer */}
          <CountdownTimer
            duration={60}
            label="Night Phase"
            phase="night"
            onComplete={() => console.log("Night phase ended")}
          />

          {/* Role Info */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className={`rounded-lg p-6 border-2 ${
          playerRole === PlayerRole.Mafia
            ? "bg-red-50 border-red-300"
            : playerRole === PlayerRole.Detective
            ? "bg-blue-50 border-blue-300"
            : playerRole === PlayerRole.Doctor
            ? "bg-green-50 border-green-300"
            : playerRole === PlayerRole.Citizen
            ? "bg-slate-50 border-slate-300"
            : "bg-gray-50 border-gray-300"
        }`}>
          <div className="flex items-center gap-4 mb-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              {roleConfig.icon}
            </motion.span>
            <div>
              <Typography.TypographyH3 className="border-0 mb-1">
                {roleConfig.title}
              </Typography.TypographyH3>
              <Typography.TypographyP className="text-gray-600 m-0">
                {roleConfig.description}
              </Typography.TypographyP>
            </div>
          </div>


        </div>
      </motion.div>

      {/* Status Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-6"
      >
        {playerHasActed ? (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <Typography.TypographyP className="text-green-700 font-semibold m-0">
              ✓ Action completed. Waiting for other players...
            </Typography.TypographyP>
          </div>
        ) : playerRole === PlayerRole.Citizen ? (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <Typography.TypographyP className="text-blue-700 m-0">
              Citizens have no night action. Wait for the voting phase.
            </Typography.TypographyP>
          </div>
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <Typography.TypographyP className="text-yellow-700 font-semibold m-0">
              ⏳ Choose your target below
            </Typography.TypographyP>
          </div>
        )}
      </motion.div>

      {/* Player Cards */}
      {!playerHasActed && playerRole !== PlayerRole.Citizen && (
        <div className="flex flex-row gap-4 items-center justify-center mb-6 flex-wrap">
          {players.map((player, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <ClickablePlayerCard
                player={player}
                index={i}
                gamePhase={1} // Night phase
                onClick={() => onTakeAction(i)}
              />
            </motion.div>
          ))}
        </div>
      )}

          {/* Whistleblower Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <WhistleblowerButton
              players={players}
              onBlowWhistle={onBlowWhistle}
              disabled={isLoading}
              currentRound={currentRound}
            />
            <Typography.TypographyXSmall className="text-center text-gray-500 dark:text-gray-400 mt-2">
              Report suspicious activity anonymously
            </Typography.TypographyXSmall>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

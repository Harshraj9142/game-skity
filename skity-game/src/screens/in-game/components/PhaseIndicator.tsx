import { GamePhase } from "@/types";
import { motion } from "framer-motion";

interface PhaseIndicatorProps {
  phase: GamePhase;
  roundNumber?: number;
}

const phaseConfig = {
  [GamePhase.WaitingForPlayers]: {
    icon: "⏳",
    label: "Waiting for Players",
    color: "bg-slate-500",
    textColor: "text-slate-700",
  },
  [GamePhase.Night]: {
    icon: "🌙",
    label: "Night Phase",
    color: "bg-indigo-500",
    textColor: "text-indigo-700",
  },
  [GamePhase.Voting]: {
    icon: "🗳️",
    label: "Voting Phase",
    color: "bg-blue-500",
    textColor: "text-blue-700",
  },
  [GamePhase.ThresholdReveal]: {
    icon: "⏱️",
    label: "Revealing Results",
    color: "bg-purple-500",
    textColor: "text-purple-700",
  },
  [GamePhase.RoundComplete]: {
    icon: "✅",
    label: "Round Complete",
    color: "bg-green-500",
    textColor: "text-green-700",
  },
};

export const PhaseIndicator = ({ phase, roundNumber }: PhaseIndicatorProps) => {
  const config = phaseConfig[phase];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto mb-6"
    >
      <div className={`${config.color} bg-opacity-10 border-2 border-${config.color} rounded-lg p-4 backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              {config.icon}
            </motion.span>
            <div>
              <p className={`font-bold text-lg ${config.textColor}`}>{config.label}</p>
              {roundNumber && (
                <p className="text-sm text-gray-600">Round {roundNumber}</p>
              )}
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-3 h-3 rounded-full ${config.color}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

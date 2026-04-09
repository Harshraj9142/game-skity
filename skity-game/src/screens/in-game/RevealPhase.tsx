import { Button } from "@/components/ui/button";
import * as Typography from "@/components/ui/typography";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Player } from "@/screens/in-game";
import { PLAYER_NAMES } from "@/screens/in-game";

interface RevealPhaseProps {
  players: Player[];
  eliminatedPlayer: string | null;
  onStartNewRound: () => Promise<void>;
  isLoading: boolean;
}

export const RevealPhase = ({
  players,
  eliminatedPlayer,
  onStartNewRound,
  isLoading,
}: RevealPhaseProps) => {
  const [countdown, setCountdown] = useState(3);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowResult(true);
    }
  }, [countdown]);

  const eliminatedIndex = eliminatedPlayer
    ? players.findIndex((p) => p.id.toLowerCase() === eliminatedPlayer.toLowerCase())
    : -1;
  
  const eliminatedPlayerObj = eliminatedIndex >= 0 ? players[eliminatedIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      {!showResult ? (
        // Countdown
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-2xl p-12">
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1, ease: "linear" }}
              className="text-6xl block mb-6"
            >
              🔓
            </motion.span>
            <Typography.TypographyH2 className="border-0 mb-4">
              Revealing Results...
            </Typography.TypographyH2>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                color: ["#6366f1", "#8b5cf6", "#6366f1"],
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-8xl font-bold"
            >
              {countdown}
            </motion.div>
            <Typography.TypographyP className="text-gray-600 mt-4">
              Decrypting votes with zero-knowledge proofs...
            </Typography.TypographyP>
          </div>
        </motion.div>
      ) : (
        // Results
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          {eliminatedPlayerObj ? (
            <>
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-8 mb-6"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-6xl block mb-4"
                >
                  ⚠️
                </motion.span>
                <Typography.TypographyH2 className="border-0 mb-4">
                  Player Eliminated!
                </Typography.TypographyH2>

                {/* Eliminated Player Card */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="inline-block bg-white rounded-xl p-6 shadow-lg border-2 border-red-300"
                >
                  <img
                    src={`assets/avatars/${eliminatedIndex}.jpeg`}
                    className="w-32 h-32 rounded-full mx-auto mb-4 grayscale"
                    alt="Eliminated player"
                  />
                  <Typography.TypographyH3 className="border-0 mb-2">
                    {PLAYER_NAMES[eliminatedIndex]}
                  </Typography.TypographyH3>
                  <Typography.TypographyP className="text-red-600 font-bold m-0">
                    Has been eliminated
                  </Typography.TypographyP>
                </motion.div>
              </motion.div>

              {/* Vote Tally Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto"
              >
                <Typography.TypographySmall className="text-blue-800">
                  🔒 Vote tally was computed using threshold cryptography. 
                  Individual votes remain private.
                </Typography.TypographySmall>
              </motion.div>
            </>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-8 mb-6">
              <Typography.TypographyH2 className="border-0 mb-4">
                No Elimination
              </Typography.TypographyH2>
              <Typography.TypographyP className="text-gray-600">
                The votes were tied or no consensus was reached.
              </Typography.TypographyP>
            </div>
          )}

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onStartNewRound}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-6 text-lg shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⚙️
                  </motion.span>
                  Starting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>▶️</span>
                  Continue to Next Round
                </span>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

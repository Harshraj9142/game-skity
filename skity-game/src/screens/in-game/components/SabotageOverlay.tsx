import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import * as Typography from "@/components/ui/typography";

interface SabotageOverlayProps {
  isActive: boolean;
  duration: number; // seconds
  onExpire: () => void;
}

export const SabotageOverlay = ({ isActive, duration, onExpire }: SabotageOverlayProps) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    if (!isActive) return;

    setTimeRemaining(duration);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration, onExpire]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
        className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 shadow-2xl max-w-md mx-4 border-4 border-red-400"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-center mb-4"
        >
          <span className="text-8xl">🚨</span>
        </motion.div>

        <Typography.TypographyH2 className="text-white text-center mb-2 border-0">
          SABOTAGE ACTIVE
        </Typography.TypographyH2>

        <Typography.TypographyP className="text-red-100 text-center mb-6">
          Voting has been blacked out by the Mafia!
        </Typography.TypographyP>

        <motion.div
          className="bg-white bg-opacity-20 rounded-lg p-6 text-center"
          animate={{ backgroundColor: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Typography.TypographyH2 className="text-white font-mono border-0">
            {timeRemaining}
          </Typography.TypographyH2>
          <Typography.TypographySmall className="text-red-100">
            seconds remaining
          </Typography.TypographySmall>
        </motion.div>

        <motion.div
          className="mt-6 flex gap-2 justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-red-300 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

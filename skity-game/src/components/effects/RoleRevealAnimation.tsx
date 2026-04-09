import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import * as Typography from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { PlayerRole } from "@/types";

interface RoleRevealAnimationProps {
  onReveal: () => Promise<void>;
  revealedRole: PlayerRole | null;
  isRevealing: boolean;
}

const roleConfig = {
  [PlayerRole.Mafia]: {
    name: "Mafia",
    icon: "🥷",
    color: "from-red-500 to-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    description: "Eliminate players and avoid detection",
  },
  [PlayerRole.Detective]: {
    name: "Detective",
    icon: "🕵️",
    color: "from-blue-500 to-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    description: "Investigate players to find the Mafia",
  },
  [PlayerRole.Doctor]: {
    name: "Doctor",
    icon: "👨‍⚕️",
    color: "from-green-500 to-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    description: "Protect players from elimination",
  },
  [PlayerRole.Citizen]: {
    name: "Citizen",
    icon: "👤",
    color: "from-gray-500 to-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-500",
    description: "Vote wisely to find the Mafia",
  },
  [PlayerRole.Unknown]: {
    name: "Unknown",
    icon: "❓",
    color: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-400",
    description: "Click to reveal your role",
  },
};

export const RoleRevealAnimation = ({
  onReveal,
  revealedRole,
  isRevealing,
}: RoleRevealAnimationProps) => {
  const [showCard, setShowCard] = useState(false);

  const handleReveal = async () => {
    setShowCard(true);
    await onReveal();
  };

  const config = revealedRole !== null ? roleConfig[revealedRole] : roleConfig[PlayerRole.Unknown];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        {!showCard ? (
          <motion.div
            key="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mb-6"
            >
              <div className="text-8xl">🎭</div>
            </motion.div>

            <Typography.TypographyH2 className="mb-4 border-0">
              Ready to reveal your role?
            </Typography.TypographyH2>

            <Typography.TypographyP className="text-gray-600 mb-8">
              Your secret role determines your abilities in the game
            </Typography.TypographyP>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleReveal}
                disabled={isRevealing}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold px-12 py-6 text-lg shadow-2xl"
              >
                {isRevealing ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⚙️
                    </motion.span>
                    Revealing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🎭</span>
                    Reveal My Role
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        ) : revealedRole !== null && revealedRole !== PlayerRole.Unknown ? (
          <motion.div
            key="card"
            initial={{ rotateY: 90, scale: 0.8 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.8,
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-full max-w-md"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(0,0,0,0.1)",
                  "0 0 40px rgba(139, 92, 246, 0.3)",
                  "0 0 20px rgba(0,0,0,0.1)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`${config.bgColor} border-4 ${config.borderColor} rounded-2xl p-8 relative overflow-hidden`}
            >
              {/* Glow effect */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-20 blur-xl`}
              />

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-center mb-6"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-9xl"
                  >
                    {config.icon}
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Typography.TypographyH2
                    className={`text-center mb-4 border-0 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}
                  >
                    {config.name}
                  </Typography.TypographyH2>

                  <Typography.TypographyP className="text-center text-gray-700 font-medium">
                    {config.description}
                  </Typography.TypographyP>
                </motion.div>

                {/* Sparkle particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: [0, (i % 2 === 0 ? 1 : -1) * 100],
                      y: [0, -100],
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.6 + i * 0.1,
                      ease: "easeOut",
                    }}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: `${20 + i * 10}%`,
                      top: "50%",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Info box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-lg p-4"
            >
              <Typography.TypographySmall className="text-purple-800 text-center">
                🔒 Your role is private and secured with zero-knowledge proofs
              </Typography.TypographySmall>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

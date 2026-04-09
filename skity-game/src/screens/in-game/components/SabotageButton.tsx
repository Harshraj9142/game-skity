import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import * as Typography from "@/components/ui/typography";

interface SabotageButtonProps {
  onTrigger: () => Promise<void>;
  disabled: boolean;
  sabotageUsed: boolean;
}

export const SabotageButton = ({ onTrigger, disabled, sabotageUsed }: SabotageButtonProps) => {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleClick = async () => {
    setIsTriggering(true);
    try {
      await onTrigger();
    } finally {
      setIsTriggering(false);
    }
  };

  if (sabotageUsed) {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
        <Typography.TypographySmall className="text-gray-500">
          ⚠️ Sabotage already used this game
        </Typography.TypographySmall>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Button
        onClick={handleClick}
        disabled={disabled || isTriggering}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-6 text-lg shadow-lg relative overflow-hidden group"
      >
        <motion.div
          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isTriggering ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⚙️
              </motion.span>
              Activating...
            </>
          ) : (
            <>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                🚨
              </motion.span>
              TRIGGER SABOTAGE
            </>
          )}
        </span>
      </Button>
      <Typography.TypographyXSmall className="text-center text-gray-500 mt-2">
        Blacks out voting for 30 seconds • One-time use
      </Typography.TypographyXSmall>
    </motion.div>
  );
};

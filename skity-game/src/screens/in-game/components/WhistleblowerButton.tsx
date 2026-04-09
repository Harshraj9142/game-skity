import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import * as Typography from "@/components/ui/typography";
import { Player } from "@/screens/in-game";
import { PLAYER_NAMES } from "@/screens/in-game";

interface WhistleblowerButtonProps {
  players: Player[];
  onBlowWhistle: (suspectId: number) => Promise<void>;
  disabled: boolean;
  currentRound: number;
}

export const WhistleblowerButton = ({ 
  players, 
  onBlowWhistle, 
  disabled,
  currentRound 
}: WhistleblowerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedPlayer === null) return;
    
    setIsSubmitting(true);
    try {
      await onBlowWhistle(selectedPlayer);
      setIsOpen(false);
      setSelectedPlayer(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 shadow-lg"
        >
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              📢
            </motion.span>
            Blow Whistle
          </span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">📢</span>
                <div>
                  <Typography.TypographyH3 className="border-0 mb-1">
                    Anonymous Alert
                  </Typography.TypographyH3>
                  <Typography.TypographySmall className="text-gray-500">
                    Report suspicious activity
                  </Typography.TypographySmall>
                </div>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-4">
                <Typography.TypographySmall className="text-orange-800">
                  🔒 Your identity will never be revealed on-chain. This alert is completely anonymous.
                </Typography.TypographySmall>
              </div>

              <Typography.TypographyP className="font-semibold mb-3">
                Who do you suspect?
              </Typography.TypographyP>

              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {players.map((player, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPlayer(index)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedPlayer === index
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={`assets/avatars/${index}.jpeg`} 
                        className="w-12 h-12 rounded-full"
                        alt={PLAYER_NAMES[index]}
                      />
                      <div className="text-left">
                        <Typography.TypographyP className="font-semibold m-0">
                          {PLAYER_NAMES[index]}
                        </Typography.TypographyP>
                        <Typography.TypographyXSmall className="text-gray-500">
                          Player {index + 1}
                        </Typography.TypographyXSmall>
                      </div>
                      {selectedPlayer === index && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto text-2xl"
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={selectedPlayer === null || isSubmitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {isSubmitting ? "Sending..." : "Send Alert"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

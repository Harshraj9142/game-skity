import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import * as Typography from "./ui/typography";
import { motion, AnimatePresence } from "framer-motion";

interface UsernameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
  onClose: () => void;
}

export const UsernameModal = ({ isOpen, onSubmit, onClose }: UsernameModalProps) => {
  const [username, setUsername] = useState("");

  const handleSubmit = () => {
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <Typography.TypographyH3 className="mb-4 text-center border-0">
              Choose Your Username
            </Typography.TypographyH3>
            
            <Typography.TypographyP className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Enter a name to identify yourself in the game
            </Typography.TypographyP>

            <Input
              placeholder="Enter your username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="mb-4"
              autoFocus
              maxLength={20}
            />

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!username.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
              >
                Join Game
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

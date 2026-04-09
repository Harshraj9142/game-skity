import { Button } from "@/components/ui/button";
import * as Typography from "@/components/ui/typography";
import { motion } from "framer-motion";
import { ActivePlayerCard, WaitingPlayerCard } from "@/components/player-cards";
import InviteFriends from "@/components/invite-friends";
import { Player } from "@/screens/in-game";

interface WaitingRoomProps {
  players: Player[];
  roomId: string;
  playerIsJoined: boolean;
  onJoinGame: () => void;
  onInitGame: () => void;
  isLoading: boolean;
}

export const WaitingRoom = ({
  players,
  roomId,
  playerIsJoined,
  onJoinGame,
  onInitGame,
  isLoading,
}: WaitingRoomProps) => {
  const isFull = players.length >= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Typography.TypographyH2 className="border-0">
            {isFull ? "Room Full! 🎉" : "Waiting for Players..."}
          </Typography.TypographyH2>
        </motion.div>
        <Typography.TypographyP className="text-gray-600">
          {isFull
            ? "Ready to start the game"
            : `${players.length}/4 players joined`}
        </Typography.TypographyP>
      </div>

      {/* Player Cards */}
      <div className="flex flex-row gap-4 items-center justify-center mb-8 flex-wrap">
        {players.map((player, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <ActivePlayerCard player={player} index={i} />
          </motion.div>
        ))}
        {Array(4 - players.length)
          .fill(null)
          .map((_, i) => (
            <motion.div
              key={`waiting-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (players.length + i) * 0.1 }}
            >
              <WaitingPlayerCard />
            </motion.div>
          ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4">
        {isFull ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onInitGame}
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
                  <span>🎮</span>
                  Begin Game
                </span>
              )}
            </Button>
          </motion.div>
        ) : playerIsJoined ? (
          <InviteFriends roomId={roomId} />
        ) : (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onJoinGame}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-8 py-6 text-lg shadow-lg"
            >
              {isLoading ? "Joining..." : "Join Game"}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Info Box */}
      {!isFull && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 max-w-md mx-auto"
        >
          <Typography.TypographySmall className="text-blue-800 text-center">
            💡 Share the room ID with friends to play together!
          </Typography.TypographySmall>
        </motion.div>
      )}
    </motion.div>
  );
};

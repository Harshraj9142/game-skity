import { motion } from 'framer-motion';
import * as Typography from '@/components/ui/typography';

interface VoteProgressBarProps {
  votedCount: number;
  totalPlayers: number;
}

export const VoteProgressBar = ({ votedCount, totalPlayers }: VoteProgressBarProps) => {
  const percentage = (votedCount / totalPlayers) * 100;
  const isComplete = votedCount === totalPlayers;

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex items-center justify-between mb-2">
        <Typography.TypographySmall className="font-semibold text-gray-700 dark:text-gray-300">
          Voting Progress
        </Typography.TypographySmall>
        <Typography.TypographySmall className="font-bold text-blue-600 dark:text-blue-400">
          {votedCount}/{totalPlayers}
        </Typography.TypographySmall>
      </div>

      {/* Progress Bar */}
      <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-green-400 to-green-600'
              : 'bg-gradient-to-r from-blue-400 to-blue-600'
          }`}
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>

        {/* Checkmarks */}
        <div className="absolute inset-0 flex items-center justify-around px-2">
          {[...Array(totalPlayers)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: i < votedCount ? 1 : 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 500 }}
              className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md z-10"
            >
              {i < votedCount && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className="text-green-500 font-bold text-sm"
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 text-center"
      >
        {isComplete ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <span className="text-2xl">✅</span>
            <Typography.TypographySmall className="text-green-600 dark:text-green-400 font-bold">
              All votes cast! Revealing results...
            </Typography.TypographySmall>
          </motion.div>
        ) : (
          <Typography.TypographyXSmall className="text-gray-500 dark:text-gray-400">
            Waiting for {totalPlayers - votedCount} more {totalPlayers - votedCount === 1 ? 'vote' : 'votes'}
          </Typography.TypographyXSmall>
        )}
      </motion.div>
    </div>
  );
};

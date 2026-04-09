import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import * as Typography from '@/components/ui/typography';

interface CountdownTimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  label?: string;
  phase?: 'night' | 'voting';
}

export const CountdownTimer = ({ duration, onComplete, label, phase = 'night' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const percentage = (timeLeft / duration) * 100;
  const isUrgent = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  const getColor = () => {
    if (isCritical) return 'from-red-500 to-red-700';
    if (isUrgent) return 'from-orange-500 to-orange-700';
    if (phase === 'night') return 'from-indigo-500 to-indigo-700';
    return 'from-blue-500 to-blue-700';
  };

  const getBgColor = () => {
    if (isCritical) return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
    if (isUrgent) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700';
    if (phase === 'night') return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700';
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-md mx-auto mb-6 border-2 rounded-lg p-4 ${getBgColor()}`}
    >
      {/* Label */}
      {label && (
        <Typography.TypographySmall className="text-center font-semibold mb-3 text-gray-700 dark:text-gray-300">
          {label}
        </Typography.TypographySmall>
      )}

      {/* Timer Display */}
      <div className="flex items-center justify-center mb-3">
        <motion.div
          animate={
            isCritical
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }
              : isUrgent
              ? {
                  scale: [1, 1.05, 1],
                }
              : {}
          }
          transition={{
            duration: isCritical ? 0.5 : 1,
            repeat: isCritical || isUrgent ? Infinity : 0,
          }}
          className="relative"
        >
          <Typography.TypographyH2
            className={`font-mono border-0 bg-gradient-to-r ${getColor()} bg-clip-text text-transparent`}
          >
            {formatTime(timeLeft)}
          </Typography.TypographyH2>

          {/* Pulse effect for urgent */}
          {isUrgent && (
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${getColor()} blur-xl`}
            />
          )}
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full`}
        >
          {/* Pulse animation */}
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="absolute inset-0 bg-white/30"
          />
        </motion.div>
      </div>

      {/* Warning Messages */}
      {isCritical && (
        <motion.div
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
          className="mt-3 text-center"
        >
          <Typography.TypographySmall className="text-red-600 dark:text-red-400 font-bold">
            ⚠️ TIME RUNNING OUT!
          </Typography.TypographySmall>
        </motion.div>
      )}

      {isUrgent && !isCritical && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center"
        >
          <Typography.TypographyXSmall className="text-orange-600 dark:text-orange-400 font-semibold">
            ⏰ Hurry up!
          </Typography.TypographyXSmall>
        </motion.div>
      )}
    </motion.div>
  );
};

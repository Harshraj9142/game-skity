import { motion } from "framer-motion";

export const PlayerCardSkeleton = () => {
  return (
    <div className="p-4 w-full max-w-[140px] md:max-w-[150px] lg:max-w-[180px] border-2 border-gray-200 rounded-lg">
      <motion.div
        animate={{
          backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full aspect-square rounded-lg mb-3"
      />
      <motion.div
        animate={{
          backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1,
        }}
        className="h-4 rounded mb-2"
      />
      <motion.div
        animate={{
          backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
        className="h-3 rounded w-3/4"
      />
    </div>
  );
};

export const GameLoadingSkeleton = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header Skeleton */}
      <div className="flex justify-center items-center gap-3 mb-8">
        <motion.div
          animate={{
            backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-8 w-48 rounded"
        />
      </div>

      {/* Phase Indicator Skeleton */}
      <motion.div
        animate={{
          backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-20 rounded-lg mb-6 max-w-md mx-auto"
      />

      {/* Player Cards Skeleton */}
      <div className="flex flex-row gap-4 items-center justify-center flex-wrap">
        {[...Array(4)].map((_, i) => (
          <PlayerCardSkeleton key={i} />
        ))}
      </div>

      {/* Action Button Skeleton */}
      <div className="mt-8 flex justify-center">
        <motion.div
          animate={{
            backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-12 w-48 rounded-lg"
        />
      </div>
    </div>
  );
};

export const RoomPickerSkeleton = () => {
  return (
    <div className="max-w-xs m-auto mt-6 p-6">
      <motion.div
        animate={{
          backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-10 rounded mb-6"
      />

      <div className="flex flex-col gap-4">
        <motion.div
          animate={{
            backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-12 rounded"
        />
        <motion.div
          animate={{
            backgroundColor: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1,
          }}
          className="h-12 rounded"
        />
      </div>
    </div>
  );
};

export const SpinnerReplacement = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full"
      />
      <motion.p
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-gray-600 font-medium"
      >
        Loading game...
      </motion.p>
    </div>
  );
};

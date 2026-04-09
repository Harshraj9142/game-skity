import { motion, AnimatePresence } from "framer-motion";
import * as Typography from "@/components/ui/typography";

interface Alert {
  id: number;
  location: number;
  roundId: number;
}

interface AlertsListProps {
  alerts: Alert[];
}

export const AlertsList = ({ alerts }: AlertsListProps) => {
  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="w-full max-w-md mx-auto mb-4"
    >
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-2xl"
          >
            🚨
          </motion.span>
          <Typography.TypographyP className="font-bold text-red-700 m-0">
            Anonymous Alerts
          </Typography.TypographyP>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-md p-3 border border-red-200 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">📍</span>
                  <div className="flex-1">
                    <Typography.TypographySmall className="text-red-800 font-medium m-0">
                      Suspicious activity at Location {alert.location}
                    </Typography.TypographySmall>
                    <Typography.TypographyXSmall className="text-gray-500 m-0">
                      Round {alert.roundId} • Anonymous tip
                    </Typography.TypographyXSmall>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Typography.TypographyXSmall className="text-gray-500 mt-3 text-center">
          🔒 Reporter identities are never revealed on-chain
        </Typography.TypographyXSmall>
      </div>
    </motion.div>
  );
};

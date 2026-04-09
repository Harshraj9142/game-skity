import { useWallet } from "@/context/WalletContext";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import * as Typography from "./ui/typography";
import { shortenEthAddress } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Player } from "@/screens/in-game";
import { PLAYER_NAMES } from "@/screens/in-game";
import { GamePhase } from "@/types";
import { motion } from "framer-motion";

export const ActivePlayerCard = ({ player, index }: { player: Player; index: number }) => {
  const { shieldedAddress } = useWallet();
  const [isYou, setIsYou] = useState<"loading" | true | false>("loading");

  useEffect(() => {
    const fetchData = async () => {
      const w = shieldedAddress?.toLowerCase() || "";
      const a = player.id.toLowerCase();
      if (w === a) {
        setIsYou(true);
      } else {
        setIsYou(false);
      }
    };
    fetchData();
  }, [player, shieldedAddress]);

  return (
    <Card
      className={`p-4 w-full max-w-[140px] md:max-w-[150px] lg:max-w-[180px] text-left ${
        isYou ? "border-zinc-400" : "0"
      }`}
      style={{ boxShadow: "0px 8px 10px -3px rgba(0, 0, 0, 0.04), 0px 2px 4px -4px rgba(16, 24, 40, 0.02)" }}>
      <CardContent className="p-0">
        {isYou && <Badge className="absolute translate-x-1 translate-y-1 opacity-85 animate-pulse">You</Badge>}
        <img src={`assets/avatars/${index}.jpeg`} width={200} height={200} />
      </CardContent>
      <CardFooter className="flex flex-col w-full text-left p-0">
        <Typography.TypographyP className="text-left w-full font-bold text-xs md:text-sm">
          {PLAYER_NAMES[index]}
        </Typography.TypographyP>
        <Typography.TypographySmall className="text-left w-full font-normal text-zinc-500 text-xs md:text-sm">
          {shortenEthAddress(player.id)}
        </Typography.TypographySmall>
      </CardFooter>
    </Card>
  );
};

export const WaitingPlayerCard = () => {
  return (
    <Card
      className={`w-full max-w-[100px] md:max-w-[100px] lg:max-w-[115px] text-xs md:text-sm text-left bg-none border-dashed text-slate-500 bg-slate-100 animate-pulse`}>
      <CardContent />
      <CardFooter className="flex items-center justify-center w-full">
        <Typography.TypographyXSmall>Waiting for frens to join...</Typography.TypographyXSmall>
      </CardFooter>
    </Card>
  );
};

export const ClickablePlayerCard = ({
  player,
  index,
  gamePhase,
  onClick,
}: {
  player: Player;
  index: number;
  onClick: () => void;
  gamePhase: GamePhase;
}) => {
  const { shieldedAddress } = useWallet();
  const [isYou, setIsYou] = useState<"loading" | true | false>("loading");

  useEffect(() => {
    const fetchData = async () => {
      const w = shieldedAddress?.toLowerCase() || "";
      const a = player.id?.toLowerCase() || "";
      if (w === a) {
        setIsYou(true);
      } else {
        setIsYou(false);
      }
    };
    fetchData();
  }, [player, shieldedAddress]);

  const hasActed = gamePhase === GamePhase.Night && player.action;
  const hasVoted = gamePhase === GamePhase.Voting && player.vote;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, y: -5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative"
    >
      {/* Glow effect on hover */}
      <motion.div
        whileHover={{
          boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
        }}
        className="rounded-lg"
      >
        <Card
          className={`p-4 w-full max-w-[140px] md:max-w-[150px] lg:max-w-[180px] text-left relative ${
            isYou ? "border-blue-400 border-2" : "border-gray-200"
          } ${!player.alive ? "opacity-60" : ""} ${
            hasActed || hasVoted ? "border-green-400 border-2" : ""
          }`}
          style={{
            boxShadow: "0px 8px 10px -3px rgba(0, 0, 0, 0.04), 0px 2px 4px -4px rgba(16, 24, 40, 0.02)",
          }}
        >
          <CardContent className="p-0 relative">
            {isYou && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge className="absolute translate-x-1 translate-y-1 z-10 bg-blue-500">You</Badge>
              </motion.div>
            )}

            {/* Status badges */}
            {(hasActed || hasVoted) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 z-10"
              >
                <Badge className="bg-green-500">✓</Badge>
              </motion.div>
            )}

            <img
              src={`assets/avatars/${index}.jpeg`}
              width={200}
              height={200}
              className={`rounded-lg ${!player.alive ? "grayscale" : ""}`}
              alt={PLAYER_NAMES[index]}
            />

            {/* Dead player overlay */}
            {!player.alive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg"
              >
                <span className="text-6xl">💀</span>
              </motion.div>
            )}

            {/* Status text */}
            <div className="mt-2">
              <Typography.TypographySmall className="text-center">
                {gamePhase === GamePhase.Night && !player.action && player.alive && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-yellow-600"
                  >
                    ⏳ Awaiting action
                  </motion.span>
                )}
                {gamePhase === GamePhase.Voting && !player.vote && player.alive && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-blue-600"
                  >
                    ⏳ Awaiting vote
                  </motion.span>
                )}
                {!player.alive && <span className="text-red-500 font-bold">ELIMINATED</span>}
              </Typography.TypographySmall>
            </div>
          </CardContent>
          <CardFooter className="flex w-full flex-col text-left p-0 mt-2">
            <Typography.TypographyP className="text-left w-full font-bold text-xs md:text-sm">
              {PLAYER_NAMES[index]}
            </Typography.TypographyP>
            <Typography.TypographySmall className="text-left w-full font-normal text-zinc-500 text-xs md:text-sm">
              {shortenEthAddress(player.id)}
            </Typography.TypographySmall>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.button>
  );
};

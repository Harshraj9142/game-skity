import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import * as Typography from "./ui/typography";
import { Copy, Check } from "lucide-react";

const RoomPicker = ({
  setGameContract,
}: {
  setGameContract: Dispatch<SetStateAction<string>>;
}) => {
  // Default to the deployed preprod contract
  const DEFAULT_CONTRACT = "344d8ad330d47d56b8175c73e00fac279d196610a73e2621b110b28369a25f29";
  
  const [roomId, setRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  // Helper: Convert Room ID to contract address
  const roomIdToContract = (id: string): string | null => {
    // Room ID is first 8 chars of contract address
    // For demo, we'll use the default contract if Room ID matches
    const cleanId = id.trim().toLowerCase();
    
    if (cleanId === DEFAULT_CONTRACT.slice(0, 8)) {
      return DEFAULT_CONTRACT;
    }
    
    // Check localStorage for stored contracts
    const storedContracts = JSON.parse(localStorage.getItem('game-contracts') || '{}');
    if (storedContracts[cleanId]) {
      return storedContracts[cleanId];
    }
    
    // If it looks like a full contract address, use it directly
    if (cleanId.length === 64 && /^[0-9a-f]+$/.test(cleanId)) {
      return cleanId;
    }
    
    return null;
  };

  // Helper: Store contract address with Room ID
  const storeContract = (contractAddress: string) => {
    const roomId = contractAddress.slice(0, 8);
    const storedContracts = JSON.parse(localStorage.getItem('game-contracts') || '{}');
    storedContracts[roomId] = contractAddress;
    localStorage.setItem('game-contracts', JSON.stringify(storedContracts));
    return roomId;
  };

  const handleJoinRoom = () => {
    const contractAddress = roomIdToContract(roomId);
    
    if (!contractAddress) {
      alert(`Room ID "${roomId}" not found. Please check the Room ID and try again.\n\nRoom ID should be 8 characters (e.g., "344d8ad3")`);
      return;
    }
    
    console.log(`Joining room ${roomId} → Contract: ${contractAddress}`);
    setGameContract(contractAddress);
  };

  const handleCreateRoom = async () => {
    try {
      // For demo, use the default contract
      // In production, this would deploy a new contract
      const contractAddress = DEFAULT_CONTRACT;
      const newRoomId = storeContract(contractAddress);
      
      setCreatedRoomId(newRoomId);
      setGameContract(contractAddress);
      
      console.log(`Created room ${newRoomId} → Contract: ${contractAddress}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room. Please try again.");
    }
  };

  const handleCopyRoomId = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseDefaultRoom = () => {
    const defaultRoomId = DEFAULT_CONTRACT.slice(0, 8);
    setRoomId(defaultRoomId);
    setGameContract(DEFAULT_CONTRACT);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      <div className="text-center space-y-2">
        <Typography.TypographyH2>Join a Game</Typography.TypographyH2>
        <Typography.TypographyP className="text-slate-600 dark:text-slate-400">
          Enter a Room ID to join an existing game
        </Typography.TypographyP>
      </div>

      {createdRoomId && (
        <div className="w-full max-w-md p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg">
          <Typography.TypographyP className="text-green-900 dark:text-green-100 font-semibold mb-2">
            🎉 Room Created!
          </Typography.TypographyP>
          <div className="flex items-center gap-2">
            <Typography.TypographyP className="text-green-800 dark:text-green-200 font-mono text-lg m-0">
              {createdRoomId}
            </Typography.TypographyP>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyRoomId}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Typography.TypographyP className="text-green-700 dark:text-green-300 text-xs mt-2 m-0">
            Share this Room ID with your friends to play together!
          </Typography.TypographyP>
        </div>
      )}

      <div className="w-full max-w-md space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Room ID (8 characters, e.g., 344d8ad3)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="flex-1 font-mono"
            maxLength={64}
          />
          <Button onClick={handleJoinRoom} disabled={!roomId.trim()}>
            Join
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-300 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-slate-500">Or</span>
          </div>
        </div>

        <Button onClick={handleCreateRoom} variant="outline" className="w-full">
          Create New Game
        </Button>
      </div>

      <div className="mt-8 space-y-3 max-w-md w-full">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Typography.TypographyP className="text-sm text-blue-900 dark:text-blue-100 mb-2">
            <strong>Quick Start:</strong> Try the demo room
          </Typography.TypographyP>
          <Button
            onClick={handleUseDefaultRoom}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Use Demo Room ({DEFAULT_CONTRACT.slice(0, 8)})
          </Button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <Typography.TypographyP className="text-xs text-slate-700 dark:text-slate-300">
            <strong>How it works:</strong>
          </Typography.TypographyP>
          <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1 mt-2">
            <li>Room ID = First 8 characters of contract address</li>
            <li>Share Room ID with friends (easier than full address)</li>
            <li>4 players needed to start the game</li>
            <li>Contract deployed on Midnight Preprod network</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomPicker;

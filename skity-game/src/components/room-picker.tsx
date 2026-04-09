import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import * as Typography from "./ui/typography";

const RoomPicker = ({
  setGameContract,
}: {
  setGameContract: Dispatch<SetStateAction<string>>;
}) => {
  // Default to the deployed preprod contract
  const [contractAddress, setContractAddress] = useState("344d8ad330d47d56b8175c73e00fac279d196610a73e2621b110b28369a25f29");

  const handleJoinRoom = () => {
    if (contractAddress.trim()) {
      setGameContract(contractAddress.trim());
    }
  };

  const handleCreateRoom = async () => {
    try {
      alert("Deploying new contract... This may take a moment.");
      // TODO: Implement contract deployment
      // For now, just use the existing contract
      alert("Contract deployment not yet implemented. Using existing contract for demo.");
      setGameContract(contractAddress);
    } catch (error) {
      console.error("Failed to deploy contract:", error);
      alert("Failed to deploy contract. Please use an existing contract address.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      <div className="text-center space-y-2">
        <Typography.TypographyH2>Join a Game</Typography.TypographyH2>
        <Typography.TypographyP className="text-slate-600 dark:text-slate-400">
          Enter a contract address to join an existing game
        </Typography.TypographyP>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Contract address (0x...)"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleJoinRoom} disabled={!contractAddress.trim()}>
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

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-md">
        <Typography.TypographyP className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Demo Contract:</strong> Use the deployed contract address from your CLI deployment
        </Typography.TypographyP>
      </div>
    </div>
  );
};

export default RoomPicker;

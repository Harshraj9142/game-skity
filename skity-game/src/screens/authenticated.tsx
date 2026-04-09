import Navbar from "@/components/navbar";
import { useState } from "react";
import InGameScreen from "./in-game";
import RoomPicker from "@/components/room-picker";
import BottomBar from "@/components/bottom-bar";
import { ErrorBoundary } from "react-error-boundary";

const Authenticated = () => {
  const [gameContract, setGameContract] = useState<string>("");
  const [shouldAutoJoin, setShouldAutoJoin] = useState(false);

  const handleEnterRoom = (contractAddress: string, autoJoin: boolean) => {
    setShouldAutoJoin(autoJoin);
    setGameContract(contractAddress);
  };

  return (
    <div>
      <Navbar />
      {!gameContract ? (
        <RoomPicker onEnterRoom={handleEnterRoom} />
      ) : (
        <ErrorBoundary fallback={<p>there was an error. please try again.</p>}>
          <InGameScreen
            gameContract={gameContract}
            setGameContract={setGameContract}
            shouldAutoJoin={shouldAutoJoin}
            onAutoJoinHandled={() => setShouldAutoJoin(false)}
          />
        </ErrorBoundary>
      )}
      <BottomBar />
    </div>
  );
};

export default Authenticated;

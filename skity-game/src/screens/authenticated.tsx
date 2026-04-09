import Navbar from "@/components/navbar";
import { useState } from "react";
import InGameScreen from "./in-game";
import RoomPicker from "@/components/room-picker";
import BottomBar from "@/components/bottom-bar";
import { ErrorBoundary } from "react-error-boundary";

const Authenticated = () => {
  const [gameContract, setGameContract] = useState<string>("");

  return (
    <div>
      <Navbar />
      {!gameContract ? (
        <RoomPicker setGameContract={setGameContract} />
      ) : (
        <ErrorBoundary fallback={<p>there was an error. please try again.</p>}>
          <InGameScreen gameContract={gameContract} setGameContract={setGameContract} />
        </ErrorBoundary>
      )}
      <BottomBar />
    </div>
  );
};

export default Authenticated;

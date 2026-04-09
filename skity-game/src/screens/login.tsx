import { Button } from "@/components/ui/button";
import { TypographyH4 } from "@/components/ui/typography";
import { useWallet } from "@/context/WalletContext";
import { Loader2 } from "lucide-react";

const Login = () => {
  const { connect, connecting } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
      alert("Failed to connect wallet. Please make sure Lace extension is installed.");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen min-w-screen">
      <img src="assets/frame.png" className="w-[480px] absolute -z-20" />
      <div className="space-y-2 flex flex-col items-center relative">
        <img src="assets/logo.png" width={220} alt="FRAMED!"></img>
        <img src="assets/sticker.png" className="absolute left-32 top-36"></img>
        <TypographyH4 className="text-slate-700 dark:text-slate-300 text-base">
          Zero-Knowledge Social Deduction on Midnight
        </TypographyH4>
        <TypographyH4 className="text-slate-600 dark:text-slate-400 text-sm">
          Connect your Lace wallet to play
        </TypographyH4>

        <Button
          size={"lg"}
          onClick={handleConnect}
          disabled={connecting}
          className="gap-2"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Lace Wallet"
          )}
        </Button>
      </div>
    </main>
  );
};

export default Login;

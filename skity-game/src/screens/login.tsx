import { Button } from "@/components/ui/button";
import { TypographyH4, TypographyP } from "@/components/ui/typography";
import { useWallet } from "@/context/WalletContext";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

const Login = () => {
  const { connect, connecting } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      setError(errorMessage);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen min-w-screen">
      <img src="assets/frame.png" className="w-[480px] absolute -z-20" />
      <div className="space-y-2 flex flex-col items-center relative max-w-md">
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <TypographyP className="text-red-800 text-sm font-semibold m-0 mb-2">
                Connection Failed
              </TypographyP>
              <TypographyP className="text-red-700 text-xs m-0 whitespace-pre-wrap">
                {error}
              </TypographyP>
              <div className="mt-3 space-y-1">
                <TypographyP className="text-red-600 text-xs m-0">
                  <strong>Troubleshooting:</strong>
                </TypographyP>
                <ul className="text-red-600 text-xs list-disc list-inside space-y-1">
                  <li>Install Lace wallet extension</li>
                  <li>Create a Midnight wallet in Lace</li>
                  <li>Switch to Preprod network</li>
                  <li>Refresh the page and try again</li>
                  <li>Check browser console for details</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <TypographyP className="text-slate-500 text-xs">
            Don't have Lace wallet?{" "}
            <a
              href="https://www.lace.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Download here
            </a>
          </TypographyP>
        </div>
      </div>
    </main>
  );
};

export default Login;

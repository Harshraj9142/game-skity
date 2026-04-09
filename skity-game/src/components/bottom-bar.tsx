import { useWallet } from "@/context/WalletContext";

const BottomBar = () => {
  const { shieldedAddress } = useWallet();

  if (!shieldedAddress) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-slate-700 py-2 px-4">
      <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-mono">
          {shieldedAddress.slice(0, 10)}...{shieldedAddress.slice(-8)}
        </span>
      </div>
    </div>
  );
};

export default BottomBar;

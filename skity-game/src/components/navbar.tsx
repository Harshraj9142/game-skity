import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { WalletButton } from "./WalletButton";
import { useWallet } from "@/context/WalletContext";

const Navbar = () => {
  const { disconnect } = useWallet();

  return (
    <div className="w-full">
      <nav className="justify-between w-full flex border-b border-slate-200 dark:border-slate-700 items-center py-3 px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <span className="text-red-500 dark:text-red-400 font-bold text-xl">Framed!</span>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <WalletButton />
          <Button size="sm" variant="outline" onClick={disconnect}>
            Disconnect
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

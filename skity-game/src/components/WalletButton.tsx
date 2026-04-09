/**
 * Wallet Connection Button
 * Displays wallet connection status and allows connect/disconnect
 */

import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';
import { Wallet, Loader2 } from 'lucide-react';

export const WalletButton: React.FC = () => {
  const { isConnected, shieldedAddress, connecting, connect, disconnect } = useWallet();

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error) {
        console.error('Connection failed:', error);
        alert('Failed to connect wallet. Please make sure Lace extension is installed.');
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isConnected && shieldedAddress && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-mono text-green-600 dark:text-green-400">
            {shieldedAddress.slice(0, 6)}...{shieldedAddress.slice(-4)}
          </span>
        </div>
      )}
      
      <Button
        onClick={handleClick}
        disabled={connecting}
        variant={isConnected ? 'outline' : 'default'}
        className="gap-2"
      >
        {connecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          <>
            <Wallet className="w-4 h-4" />
            Disconnect
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </>
        )}
      </Button>
    </div>
  );
};

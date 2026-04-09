/**
 * Wallet Context - Manages Lace wallet connection and Midnight providers
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import '@midnight-ntwrk/dapp-connector-api';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import type { GamePrivateState } from '@framed/contract';

export type MidnightGameProviders = MidnightProviders<string, string, GamePrivateState>;

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  shieldedAddress: string | null;
  connecting: boolean;
  providers: MidnightGameProviders | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectedAPI, setConnectedAPI] = useState<ConnectedAPI | null>(null);

  // ZK Config Provider (browser-compatible)
  const zkConfigProvider = useMemo(
    () => new FetchZkConfigProvider(
      `${window.location.origin}/zk-keys`,
      fetch.bind(window)
    ),
    []
  );

  // Proof provider - use preprod proof server
  const proofProvider = useMemo(() => {
    const proofServerUri = 'https://prover.preprod.midnight.network'; // Preprod proof server
    return httpClientProofProvider(proofServerUri, zkConfigProvider);
  }, [zkConfigProvider]);

  // Private state provider
  const privateStateProvider = useMemo(
    () => levelPrivateStateProvider<string, GamePrivateState>({ 
      privateStateStoreName: 'framed-game-private-state',
      signingKeyStoreName: 'framed-signing-keys',
      privateStoragePasswordProvider: () => 'framed-game-password-2024',
      accountId: shieldedAddress || 'default-account'
    }),
    [shieldedAddress]
  );

  // Public data provider - use preprod indexer
  const publicDataProvider = useMemo(
    () => indexerPublicDataProvider(
      'https://indexer.preprod.midnight.network/api/v3/graphql',
      'wss://indexer.preprod.midnight.network/api/v3/graphql/ws'
    ),
    []
  );

  // Wallet provider (wraps Lace API)
  const walletProvider = useMemo(() => {
    if (!connectedAPI) return null;
    
    return {
      getCoinPublicKey: () => {
        // ConnectedAPI doesn't expose this directly, use a placeholder
        return walletAddress || '';
      },
      getEncryptionPublicKey: () => {
        // ConnectedAPI doesn't expose this directly, use a placeholder
        return '';
      },
      balanceTx: async (tx: any, ttl?: Date) => {
        // Use Lace's balanceUnsealedTransaction for contract calls
        const result = await connectedAPI.balanceUnsealedTransaction(tx);
        return result.tx;
      },
    };
  }, [connectedAPI, walletAddress]);

  // Midnight provider (wraps Lace API)
  const midnightProvider = useMemo(() => {
    if (!connectedAPI) return null;
    
    return {
      submitTx: async (tx: any): Promise<string> => {
        try {
          // submitTransaction returns void, but we need to return a transaction ID
          // In practice, the transaction is submitted and we can track it via indexer
          await connectedAPI.submitTransaction(tx);
          // Return a placeholder ID - in production, query indexer for actual tx ID
          return 'tx-submitted-' + Date.now();
        } catch (error) {
          console.error('Failed to submit transaction:', error);
          throw error;
        }
      },
    };
  }, [connectedAPI]);

  // Combined providers
  const providers = useMemo<MidnightGameProviders | null>(() => {
    if (!walletProvider || !midnightProvider) return null;
    
    return {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider: walletProvider as any,
      midnightProvider: midnightProvider as any,
    } as MidnightGameProviders;
  }, [privateStateProvider, publicDataProvider, zkConfigProvider, proofProvider, walletProvider, midnightProvider]);

  // Connect to Lace wallet
  const connect = useCallback(async () => {
    if (connecting || isConnected) return;
    
    setConnecting(true);
    try {
      // Debug: Log what's available on window
      console.log('🔍 Checking for Lace wallet...');
      console.log('window.midnight:', window.midnight);
      
      // Check if midnight object exists
      if (!window.midnight) {
        throw new Error('Lace wallet not found. Please install the Lace extension and refresh the page.');
      }

      // Find the wallet API - it's stored with a UUID key
      const walletKeys = Object.keys(window.midnight);
      console.log('Available wallet keys:', walletKeys);
      
      // Get the first wallet API (usually there's only one)
      const walletKey = walletKeys.find(key => key !== 'mnLace' && typeof window.midnight![key] === 'object');
      
      if (!walletKey) {
        throw new Error('No Midnight wallet API found. Please make sure Lace is properly installed.');
      }

      console.log('🔌 Connecting to Lace wallet via key:', walletKey);
      
      const walletAPI = window.midnight[walletKey];
      console.log('Wallet API object:', walletAPI);
      
      // Call connect method with network ID (preprod for testnet)
      console.log('Calling connect("preprod")...');
      const api = await walletAPI.connect('preprod');
      console.log('Connect result:', api);
      
      if (!api) {
        throw new Error('Failed to connect to Lace wallet');
      }
      
      if (!api) {
        throw new Error('Failed to enable Lace wallet');
      }

      console.log('✅ Lace wallet enabled');
      
      // Get wallet addresses using the correct API method
      console.log('Getting wallet addresses...');
      const addresses = await api.getShieldedAddresses();
      console.log('📊 Wallet addresses:', addresses);
      console.log('📊 Full addresses object keys:', Object.keys(addresses));
      
      // The contract expects a coin public key (shield-cpk), not a shielded address
      // Check if coinPublicKey is available in the response
      const coinPublicKey = (addresses as any).coinPublicKey || (addresses as any).publicKey;
      
      if (addresses && addresses.shieldedAddress) {
        setConnectedAPI(api);
        setShieldedAddress(addresses.shieldedAddress);
        // Use coin public key if available, otherwise fall back to shielded address
        setWalletAddress(coinPublicKey || addresses.shieldedAddress);
        setIsConnected(true);
        console.log('✅ Connected to Lace wallet');
        console.log('   Shielded Address:', addresses.shieldedAddress);
        console.log('   Coin Public Key:', coinPublicKey || 'not found');
      } else {
        console.error('No shielded address found:', addresses);
        throw new Error('Failed to get wallet address');
      }
    } catch (error) {
      console.error('❌ Failed to connect to wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [connecting, isConnected]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setShieldedAddress(null);
    setConnectedAPI(null);
    console.log('🔌 Disconnected from wallet');
  }, []);

  // Auto-connect if previously authorized
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const api = (window as any)?.midnight?.mnLace;
        if (api && typeof api.isEnabled === 'function') {
          const enabled = await api.isEnabled();
          if (enabled && !cancelled && !isConnected) {
            await connect();
          }
        }
      } catch (err) {
        console.warn('Auto-connect failed:', err);
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [connect, isConnected]);

  const value: WalletContextType = {
    isConnected,
    walletAddress,
    shieldedAddress,
    connecting,
    providers,
    connect,
    disconnect,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

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
      console.log('🔍 Checking for Lace wallet...');
      
      // Wait a bit for extension to inject (especially important in Brave)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if midnight object exists
      const midnightObj = (window as any).midnight;
      if (typeof window === 'undefined' || !midnightObj) {
        throw new Error('Lace wallet not found. Please install the Lace extension and refresh the page.');
      }

      console.log('window.midnight:', midnightObj);
      
      // Try multiple approaches to find the wallet API
      let walletAPI: any = null;
      let api: ConnectedAPI | null = null;
      
      // Approach 1: Try mnLace (standard Lace API)
      if (midnightObj.mnLace) {
        console.log('🔌 Found mnLace API');
        walletAPI = midnightObj.mnLace;
        
        try {
          // Check if already enabled
          const isEnabled = await walletAPI.isEnabled?.();
          if (isEnabled) {
            console.log('Wallet already enabled, getting state...');
            api = await walletAPI.state();
          } else {
            console.log('Enabling wallet...');
            api = await walletAPI.enable();
          }
        } catch (err) {
          console.warn('mnLace enable failed, trying connect:', err);
          // Try connect method as fallback
          api = await walletAPI.connect?.('preprod');
        }
      }
      
      // Approach 2: Try UUID-based keys (alternative Lace API structure)
      if (!api) {
        const walletKeys = Object.keys(midnightObj).filter(
          key => key !== 'mnLace' && typeof midnightObj[key] === 'object'
        );
        console.log('Available wallet keys:', walletKeys);
        
        for (const walletKey of walletKeys) {
          try {
            console.log(`🔌 Trying wallet key: ${walletKey}`);
            walletAPI = midnightObj[walletKey];
            
            // Try different connection methods
            if (typeof walletAPI.connect === 'function') {
              api = await walletAPI.connect('preprod');
            } else if (typeof walletAPI.enable === 'function') {
              api = await walletAPI.enable();
            }
            
            if (api) {
              console.log(`✅ Connected via ${walletKey}`);
              break;
            }
          } catch (err) {
            console.warn(`Failed with key ${walletKey}:`, err);
            continue;
          }
        }
      }
      
      if (!api) {
        throw new Error('Failed to connect to Lace wallet. Please make sure:\n1. Lace extension is installed\n2. You have a Midnight wallet created\n3. You are on the Preprod network\n4. The extension has permission to access this site');
      }

      console.log('✅ Lace wallet connected, getting addresses...');
      
      // Get wallet addresses
      let addresses: any;
      try {
        // Try different methods to get addresses
        if (typeof api.getShieldedAddresses === 'function') {
          addresses = await api.getShieldedAddresses();
        } else if (typeof (api as any).getAddresses === 'function') {
          addresses = await (api as any).getAddresses();
        } else if (typeof (api as any).state === 'function') {
          const state = await (api as any).state();
          addresses = state?.addresses || state;
        }
      } catch (err) {
        console.error('Failed to get addresses:', err);
        throw new Error('Failed to get wallet addresses. Please make sure you have a Midnight wallet created in Lace.');
      }
      
      console.log('📊 Wallet addresses response:', addresses);
      console.log('📊 Address keys:', Object.keys(addresses || {}));
      
      // Extract coin public key (required by contract)
      // The Lace API returns coinPublicKey in the addresses object
      const coinPublicKey = addresses?.coinPublicKey || 
                           addresses?.publicKey ||
                           addresses?.cpk ||
                           addresses?.[0]?.coinPublicKey;
      
      // Extract shielded address (for display)
      const shieldedAddr = addresses?.shieldedAddress || 
                          addresses?.shield || 
                          addresses?.[0]?.shieldedAddress;
      
      if (!coinPublicKey) {
        console.error('No coin public key found in addresses:', addresses);
        console.error('Available keys:', Object.keys(addresses || {}));
        throw new Error(
          'No coin public key found. Please ensure:\n' +
          '1. You have a Midnight wallet created in Lace\n' +
          '2. You are on the Preprod network\n' +
          '3. Your Lace extension is up to date'
        );
      }
      
      if (!shieldedAddr) {
        console.warn('No shielded address found, using coin public key for display');
      }
      
      setConnectedAPI(api);
      setShieldedAddress(shieldedAddr || coinPublicKey);
      setWalletAddress(coinPublicKey); // Always use coin public key for contract
      setIsConnected(true);
      
      console.log('✅ Successfully connected to Lace wallet');
      console.log('   Coin Public Key (for contract):', coinPublicKey);
      console.log('   Shielded Address (for display):', shieldedAddr || 'using cpk');
      
    } catch (error) {
      console.error('❌ Failed to connect to wallet:', error);
      setConnecting(false);
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

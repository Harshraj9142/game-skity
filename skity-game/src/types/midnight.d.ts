/**
 * Type declarations for Midnight DApp Connector API
 * Extends the Window interface to include the Lace wallet API
 */

import '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: {
      mnLace: {
        apiVersion: string;
        connect: (network: 'preprod' | 'undeployed' | 'testnet') => Promise<ConnectedAPI>;
        isEnabled: () => Promise<boolean>;
      };
    };
  }
}

export interface ConnectedAPI {
  coinPublicKey: string;
  getShieldedAddresses: () => Promise<{
    shieldedAddress: string;
    unshieldedAddress: string;
  }>;
  getConnectionStatus: () => Promise<boolean>;
  balanceTracker: (address: string) => any;
  submitTransaction: (tx: any) => Promise<any>;
  uris?: {
    proverServerUri?: string;
    indexerUri?: string;
    indexerWsUri?: string;
  };
}

export {};

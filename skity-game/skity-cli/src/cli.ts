// FRAMED Game CLI - Interactive interface for testing Midnight smart contract
// Adapted from midnightntwrk/example-counter

import { type WalletContext } from './api.js';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface, type Interface } from 'node:readline/promises';
import { type Logger } from 'pino';
import { type StartedDockerComposeEnvironment, type DockerComposeEnvironment } from 'testcontainers';
import { type GameProviders, type DeployedGameContract } from './common-types.js';
import { type Config, StandaloneConfig } from './config.js';
import * as api from './api.js';

let logger: Logger;

/**
 * This seed gives access to tokens minted in the genesis block of a local development node.
 * Only used in standalone networks to build a wallet with initial funds.
 */
const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

// ─── Display Helpers ────────────────────────────────────────────────────────

const BANNER = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    FRAMED - Skity CLI                        ║
║                    ─────────────────                         ║
║         Privacy-preserving social deduction game             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

const DIVIDER = '──────────────────────────────────────────────────────────────';

// ─── Menu Helpers ──────────────────────────────────────────────────────────

const WALLET_MENU = `
${DIVIDER}
  Wallet Setup
${DIVIDER}
  [1] Create a new wallet
  [2] Restore wallet from seed
  [3] Exit
${'─'.repeat(62)}
> `;

/** Build the contract actions menu, showing current DUST balance in the header. */
const contractMenu = (dustBalance: string) => `
${DIVIDER}
  Contract Actions${dustBalance ? `                    DUST: ${dustBalance}` : ''}
${DIVIDER}
  [1] Deploy a new game contract
  [2] Join an existing game contract
  [3] Monitor DUST balance
  [4] Exit
${'─'.repeat(62)}
> `;

/** Build the game actions menu, showing current DUST balance in the header. */
const gameMenu = (dustBalance: string) => `
${DIVIDER}
  Game Actions${dustBalance ? `                        DUST: ${dustBalance}` : ''}
${DIVIDER}
  [1] Join game
  [2] Initialize game (host only)
  [3] Cast private vote
  [4] Take action (day/night)
  [5] Blow whistle (anonymous alert)
  [6] Trigger sabotage (Mafia only)
  [7] Display game state
  [8] Exit
${'─'.repeat(62)}
> `;

// ─── Wallet Setup ───────────────────────────────────────────────────────────

/** Prompt the user for a seed phrase and restore a wallet from it. */
const buildWalletFromSeed = async (config: Config, rli: Interface): Promise<WalletContext> => {
  const seed = await rli.question('Enter your wallet seed: ');
  return await api.buildWalletAndWaitForFunds(config, seed);
};

/**
 * Wallet creation flow.
 * - Standalone configs skip the menu and use the genesis seed automatically.
 * - All other configs present a menu to create or restore a wallet.
 */
const buildWallet = async (config: Config, rli: Interface): Promise<WalletContext | null> => {
  // Standalone mode: use the pre-funded genesis wallet
  if (config instanceof StandaloneConfig) {
    return await api.buildWalletAndWaitForFunds(config, GENESIS_MINT_WALLET_SEED);
  }

  while (true) {
    const choice = await rli.question(WALLET_MENU);
    switch (choice.trim()) {
      case '1':
        return await api.buildFreshWallet(config);
      case '2':
        return await buildWalletFromSeed(config, rli);
      case '3':
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

// ─── Contract Interaction ───────────────────────────────────────────────────

/** Format dust balance for menu headers. */
const getDustLabel = async (wallet: api.WalletContext['wallet']): Promise<string> => {
  try {
    const dust = await api.getDustBalance(wallet);
    return dust.available.toLocaleString();
  } catch {
    return '';
  }
};

/** Prompt for a contract address and join an existing deployed contract. */
const joinContract = async (providers: GameProviders, rli: Interface): Promise<DeployedGameContract> => {
  const contractAddress = await rli.question('Enter the contract address (hex): ');
  return await api.joinContract(providers, contractAddress);
};

/**
 * Start the DUST monitor. Shows a live-updating balance display
 * that runs until the user presses Enter.
 */
const startDustMonitor = async (wallet: api.WalletContext['wallet'], rli: Interface): Promise<void> => {
  console.log('');
  // Use readline question to wait for Enter — the monitor will render above this line
  const stopPromise = rli.question('  Press Enter to return to menu...\n').then(() => {});
  await api.monitorDustBalance(wallet, stopPromise);
  console.log('');
};

/**
 * Deploy or join flow. Returns the contract handle, or null if the user exits.
 * Errors during deploy/join are caught and displayed — the user stays in the menu.
 */
const deployOrJoin = async (
  providers: GameProviders,
  walletCtx: api.WalletContext,
  rli: Interface,
): Promise<DeployedGameContract | null> => {
  while (true) {
    const dustLabel = await getDustLabel(walletCtx.wallet);
    const choice = await rli.question(contractMenu(dustLabel));
    switch (choice.trim()) {
      case '1':
        try {
          const contract = await api.withStatus('Deploying game contract', () => {
            return api.deploy(providers, {
              role: 0,      // host starts as Citizen
              myVote: 0,
              witnessedEvents: [],
            }, 10n);
          });
          console.log(`  Contract deployed at: ${contract.deployTxData.public.contractAddress}\n`);
          return contract;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`\n  ✗ Deploy failed: ${msg}`);
          // Log the full cause chain to help debug WASM/ledger errors
          if (e instanceof Error && e.cause) {
            let cause: unknown = e.cause;
            let depth = 0;
            while (cause && depth < 5) {
              const causeMsg =
                cause instanceof Error
                  ? `${cause.message}\n      ${cause.stack?.split('\n').slice(1, 3).join('\n      ') ?? ''}`
                  : String(cause);
              console.log(`    cause: ${causeMsg}`);
              cause = cause instanceof Error ? cause.cause : undefined;
              depth++;
            }
          }
          if (msg.toLowerCase().includes('dust') || msg.toLowerCase().includes('no dust')) {
            console.log('    Insufficient DUST for transaction fees. Use option [3] to monitor your balance.');
          }
          console.log('');
        }
        break;
      case '2':
        try {
          return await joinContract(providers, rli);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Failed to join contract: ${msg}\n`);
        }
        break;
      case '3':
        await startDustMonitor(walletCtx.wallet, rli);
        break;
      case '4':
        return null;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

/**
 * Main interaction loop. Once a contract is deployed/joined, the user
 * can perform game actions like joining, voting, taking actions, etc.
 */
const mainLoop = async (providers: GameProviders, walletCtx: api.WalletContext, rli: Interface): Promise<void> => {
  const gameContract = await deployOrJoin(providers, walletCtx, rli);
  if (gameContract === null) {
    return;
  }

  while (true) {
    const dustLabel = await getDustLabel(walletCtx.wallet);
    const choice = await rli.question(gameMenu(dustLabel));
    switch (choice.trim()) {
      case '1': {
        // Join game
        try {
          const displayName = await rli.question('Enter your display name: ');
          await api.withStatus('Joining game', () => api.joinGame(gameContract, displayName));
          console.log('  ✓ Successfully joined the game\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Join failed: ${msg}\n`);
        }
        break;
      }
      case '2': {
        // Initialize game (host only)
        try {
          await api.withStatus('Initializing game', () => api.initGame(gameContract));
          console.log('  ✓ Game initialized - roles assigned!\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Init failed: ${msg}\n`);
        }
        break;
      }
      case '3': {
        // Cast private vote
        try {
          const targetInput = await rli.question('Enter target player index (0-based): ');
          const targetIdx = parseInt(targetInput, 10);
          if (isNaN(targetIdx)) {
            console.log('  ✗ Invalid player index\n');
            break;
          }
          await api.withStatus('Casting vote', () => api.castPrivateVote(gameContract, targetIdx));
          console.log('  ✓ Vote cast successfully (private)\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Vote failed: ${msg}\n`);
        }
        break;
      }
      case '4': {
        // Take action (day/night)
        try {
          const targetInput = await rli.question('Enter target player index (0-based, or -1 for no action): ');
          const targetIdx = parseInt(targetInput, 10);
          if (isNaN(targetIdx)) {
            console.log('  ✗ Invalid player index\n');
            break;
          }
          await api.withStatus('Taking action', () => api.takeAction(gameContract, targetIdx));
          console.log('  ✓ Action completed\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Action failed: ${msg}\n`);
        }
        break;
      }
      case '5': {
        // Blow whistle
        try {
          const suspectInput = await rli.question('Enter suspected Mafia player index: ');
          const suspectIdx = parseInt(suspectInput, 10);
          if (isNaN(suspectIdx)) {
            console.log('  ✗ Invalid player index\n');
            break;
          }
          await api.withStatus('Blowing whistle', () => api.blowWhistle(gameContract, suspectIdx));
          console.log('  ✓ Anonymous alert sent\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Whistle failed: ${msg}\n`);
        }
        break;
      }
      case '6': {
        // Trigger sabotage
        try {
          await api.withStatus('Triggering sabotage', () => api.triggerSabotage(gameContract));
          console.log('  ✓ Sabotage activated - 30s voting blackout!\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Sabotage failed: ${msg}\n`);
        }
        break;
      }
      case '7': {
        // Display game state
        await api.displayGameState(providers, gameContract);
        break;
      }
      case '8':
        return;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

// ─── Docker Port Mapping ────────────────────────────────────────────────────

/** Map a container's first exposed port into the config URL. */
const mapContainerPort = (env: StartedDockerComposeEnvironment, url: string, containerName: string) => {
  const mappedUrl = new URL(url);
  const container = env.getContainer(containerName);
  mappedUrl.port = String(container.getFirstMappedPort());
  return mappedUrl.toString().replace(/\/+$/, '');
};

// ─── Entry Point ────────────────────────────────────────────────────────────

/**
 * Main entry point for the CLI.
 *
 * Flow:
 *   1. (Optional) Start Docker containers for proof server / node / indexer
 *   2. Build or restore a wallet and wait for it to be funded
 *   3. Configure midnight-js providers (proof server, indexer, wallet, private state)
 *   4. Enter the contract deploy/join and game interaction loop
 *   5. Clean up: close wallet, readline, and docker environment
 */
export const run = async (config: Config, _logger: Logger, dockerEnv?: DockerComposeEnvironment): Promise<void> => {
  logger = _logger;
  api.setLogger(_logger);

  // Print the title banner
  console.log(BANNER);

  const rli = createInterface({ input, output, terminal: true });
  let env: StartedDockerComposeEnvironment | undefined;

  try {
    // Step 1: Start Docker environment if provided (e.g. local proof server)
    if (dockerEnv !== undefined) {
      env = await dockerEnv.up();

      // In standalone mode, remap ports to the dynamically assigned container ports
      if (config instanceof StandaloneConfig) {
        config.indexer = mapContainerPort(env, config.indexer, 'skity-indexer');
        config.indexerWS = mapContainerPort(env, config.indexerWS, 'skity-indexer');
        config.node = mapContainerPort(env, config.node, 'skity-node');
        config.proofServer = mapContainerPort(env, config.proofServer, 'skity-proof-server');
      }
    }

    // Step 2: Build wallet (create new or restore from seed)
    const walletCtx = await buildWallet(config, rli);
    if (walletCtx === null) {
      return;
    }

    try {
      // Step 3: Configure midnight-js providers
      const providers = await api.withStatus('Configuring providers', () => api.configureProviders(walletCtx, config));
      console.log('');

      // Step 4: Enter the game interaction loop
      await mainLoop(providers, walletCtx, rli);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Error: ${e.message}`);
        logger.debug(`${e.stack}`);
      } else {
        throw e;
      }
    } finally {
      // Step 5a: Stop the wallet
      try {
        await walletCtx.wallet.stop();
      } catch (e) {
        logger.error(`Error stopping wallet: ${e}`);
      }
    }
  } finally {
    // Step 5b: Close readline and Docker environment
    rli.close();
    rli.removeAllListeners();

    if (env !== undefined) {
      try {
        await env.down();
      } catch (e) {
        logger.error(`Error shutting down docker environment: ${e}`);
      }
    }

    logger.info('Goodbye.');
  }
};

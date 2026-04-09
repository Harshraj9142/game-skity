// FRAMED Game - Preprod mode (testnet with local proof server)
// Connects to Midnight preprod testnet, runs local proof server

import { createLogger } from './logger-utils.js';
import { run } from './cli.js';
import { PreprodConfig } from './config.js';

const config = new PreprodConfig();
const logger = await createLogger(config.logDir);
await run(config, logger);

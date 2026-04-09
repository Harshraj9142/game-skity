// FRAMED Game - Preview mode (preview network with local proof server)
// Connects to Midnight preview network, runs local proof server

import { createLogger } from './logger-utils.js';
import { run } from './cli.js';
import { PreviewConfig } from './config.js';

const config = new PreviewConfig();
const logger = await createLogger(config.logDir);
await run(config, logger);

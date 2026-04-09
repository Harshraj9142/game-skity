// FRAMED Game - Start proof server for preprod mode
// Runs only the proof server Docker container for preprod testing

import { DockerComposeEnvironment, Wait } from 'testcontainers';
import path from 'node:path';
import { currentDir } from './config.js';

const dockerEnv = new DockerComposeEnvironment(path.resolve(currentDir, '..'), 'proof-server.yml').withWaitStrategy(
  'proof-server',
  Wait.forLogMessage('actix-web-service-0.0.0.0:6300', 1),
);

console.log('Starting proof server for preprod...');
const env = await dockerEnv.up();
console.log('Proof server running on http://localhost:6300');
console.log('Press Ctrl+C to stop');

// Keep the process alive with a heartbeat and catch common signals
const heartbeat = setInterval(() => {}, 1000);

const shutdown = async () => {
  console.log('\nShutting down proof server...');
  clearInterval(heartbeat);
  await env.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

#!/usr/bin/env node

import { Command } from 'commander';
import config from '../src/config.js';
import Orchestrator from '../src/orchestrator.js';

const program = new Command();
program
  .description('Bridge BT → WebSocket & OSC streams')
  .option('-d, --device <id>', 'Bluetooth device ID', config.btDeviceId)
  .option('-w, --ws-port <n>', 'WebSocket port', config.wsPort)
  .option('-o, --osc-host <n>', 'OSC host', config.oscHost)
  .option('-p, --osc-port <n>', 'OSC port', config.oscPort)
  .parse();

const orchestrator = new Orchestrator(program.opts());
orchestrator.start();

process.on('SIGINT', async () => {
  console.log('Shutting down…');
  await orchestrator.stop();
  process.exit(0);
});
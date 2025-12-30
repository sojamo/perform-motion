#!/usr/bin/env node

// Import necessary modules
import { Command } from "commander"; // For parsing CLI arguments
import config from "../src/config.js"; // Load default config values
import Orchestrator from "../src/orchestrator.js"; // Main orchestration logic
import SerialService from "../src/services/serialService.js"; // For listing serial ports

// Set up the CLI parser with all available options
const program = new Command();
program
  .description("Bridge BT → WebSocket & OSC streams") // Describe what the CLI does
  .option("-d, --device <id>", "Bluetooth device ID", config.btDeviceId)
  .option("-w, --ws-port <n>", "WebSocket port", config.wsPort)
  .option("-o, --osc-host <n>", "OSC host", config.oscHost)
  .option("-p, --osc-port <n>", "OSC port", config.oscPort)
  .option("-l, --list", "List all serial ports and exit")
  .parse();

// Get parsed CLI options as an object
const opts = { ...program.opts(), knownDevices: config.knownDevices };

// Print the currently active
// configuration for review
console.log(`Perform Motion (unnatural): current configuration\n\n`, opts);

// Instantiate the orchestrator with
// CLI options and start the bridge
const orchestrator = new Orchestrator(opts);
orchestrator.start();

// Handle Ctrl-C (SIGINT): gracefully
// stop all services before exiting
process.on("SIGINT", async () => {
  console.log("Shutting down…");
  await orchestrator.stop();
  process.exit(0);
});

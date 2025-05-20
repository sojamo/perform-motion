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
  .option("-s, --serial-port <n>", "Serial port", config.serialPort)
  .option("-b, --serial-baudrate <n>", "Serial Baudrate", config.serialBaudrate)
  .option("-l, --list", "List all serial ports and exit")
  .parse();

const opts = program.opts(); // Get parsed CLI options as an object

// Print the currently active
// configuration for review
console.log(`Perform Motion: current configuration\n\n`, opts);

// If user wants to list serial ports
// or serialPort is empty, show serial ports
if (opts.list || opts.serialPort.length === 0) {
  // Query all available serial ports
  const ports = await SerialService.listSerialPorts();

  // Auto-select the first port
  // containing 'usbmodem' if present
  ports.forEach((el) => {
    if (
      opts.serialPort.length === 0 &&
      el.path.includes("usbmodem")
    ) {
      opts.serialPort = el.path;
    }
  });

  // Print which serial port will be used
  console.log(
    `Using Serial Port:`,
    opts.serialPort.length > 0 ? opts.serialPort : "non-detected.",
  );

  // If only listing was requested, exit
  if (opts.list) process.exit(0);
}

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

#!/usr/bin/env node

import { Command } from "commander";
import config from "../src/config.js";
import Orchestrator from "../src/orchestrator.js";
import { SerialPort } from "serialport";
import SerialService from "../src/services/serialService.js";


const program = new Command();
program
  .description("Bridge BT → WebSocket & OSC streams")
  .option("-d, --device <id>", "Bluetooth device ID", config.btDeviceId)
  .option("-w, --ws-port <n>", "WebSocket port", config.wsPort)
  .option("-o, --osc-host <n>", "OSC host", config.oscHost)
  .option("-p, --osc-port <n>", "OSC port", config.oscPort)
  .option("-s, --serial-port <n>", "Serial port", config.serialPort)
  .option("-b, --serial-baudrate <n>", "Serial Baudrate", config.serialBaudrate)
  .option("-l, --list", "List all serial ports and exit")
  .parse();


const opts = program.opts();
console.log(opts);

// Function to list serial ports
async function listSerialPorts() {
  try {
    const ports = await SerialPort.list();
    if (ports.length === 0) {
      console.log('No serial ports detected.');
      return;
    }
    console.log('Detected serial ports:');
    ports.forEach(port => {
      console.log(`• ${port.path}` +
        (port.manufacturer ? ` — ${port.manufacturer}` : '') +
        (port.serialNumber ? ` (S/N: ${port.serialNumber})` : '')
      );
    });
  } catch (err) {
    console.error('Error listing serial ports:', err);
  }
}

if (opts.list) {
  await SerialService.listSerialPorts();
  const orchestrator = new Orchestrator(opts);
  orchestrator.start();
}

process.on("SIGINT", async () => {
  console.log("Shutting down…");
  await orchestrator.stop();
  process.exit(0);
});


// (async () => {
//   if (opts.list) {
//     await listSerialPorts();
//     process.exit(0);
//   }

//   if (!opts.serialPort) {
//     console.error('Error: --port <path> is required unless --list is used.');
//     process.exit(1);
//   }

//   // Instantiate and use SerialService
//   const port = opts.serialPort;
//   const baud = parseInt(opts.serialBaudrate, 10);
//   const device = new SerialPort({
//             path: port,
//             baudRate: baud,
//             autoOpen: false,
//           });
//   const serialService = new SerialService(port, baud);
//   // try {
//   //   await serialService.open();
//   //   console.log(`Opened serial port ${opts.port} at ${opts.baud} baud.`);

//   //   // Register data handler
//   //   serialService.onData(line => {
//   //     console.log('←', line);
//   //   });

//   //   // Read from stdin to send data
//   //   process.stdin.setEncoding('utf8');
//   //   console.log('Type to send over serial. Ctrl+C to exit.');
//   //   process.stdin.on('data', input => {
//   //     const msg = input.trim();
//   //     if (msg) {
//   //       serialService.send(msg);
//   //       console.log('→', msg);
//   //     }
//   //   });

//   // } catch (err) {
//   //   console.error('Serial error:', err);
//   //   process.exit(1);
//   // }
// })();


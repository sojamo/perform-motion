// src/services/serialService.js
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import EventEmitter from "events";

/**
 * SerialService reads serial config from config.js,
 * encapsulates opening a serial port, reading lines,
 * and sending messages to the device.
 */
export default class SerialService extends EventEmitter {
  constructor(theSerialPortPath, theBaudRate = 57600) {
    super();

    this.path = theSerialPortPath;
    if(!this.path) return;
    
    this.port = new SerialPort({
      path: theSerialPortPath,
      baudRate: theBaudRate,
      autoOpen: false,
    });

    this.port.on("error", (err) => {
      console.error("Serial port error:", err);
      this.emit("error", err);
    });

    this.port.on("close", () => {
      console.log("Serial port closed");
      this.emit("close");
    });

    this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\n" }));

    this.parser.on("data", (line) => {
      this.emit("data", line.trim());
    });
  }

 
  /**
   * This code snippet defines an async method open() 
   * that opens a serial port. It returns a Promise 
   * that resolves when the port is successfully opened, 
   * or rejects with an error if the opening fails. 
   * 
   * @returns 
   */
  async start() {
    if(!this.path) return;
    return new Promise((resolve, reject) => {
      this.port.open((err) => err ? reject(err) : resolve());
    });
  }

  /**
   * Sends a string to the serial port and uses 
   * a newline character (as delimiter) to 
   * end the message
   * 
   * @param {*} message 
   */
  send(message) {
    if(!this.path) return;

    if (this.port.isOpen) {
      this.port.write(`${message}\n`);
    }
  }

  /**
   * writes a packet of bytes to the serial port 
   * 
   * @param {*} thePacket
   */
  write(thePacket) {
    if(!this.path) return;
    
    if (this.port.isOpen) {
      this.port.write(thePacket, (err) => {
        if (err) {
          console.error("Error writing packet:", err.message);
        }
      });
    }
  }

  /**
   * This code snippet defines an async method close() 
   * that closes a serial port. It returns a Promise that 
   * resolves when the port is successfully closed, 
   * or rejects with an error if the closure fails.
   * 
   * @returns 
   */
  async close() {
    return new Promise((resolve, reject) => {
      this.port.close((err) => err ? reject(err) : resolve());
    });
  }

  /**
   * This is a static method named listSerialPorts 
   * that lists all available serial ports on the system. 
   * It uses the SerialPort class to retrieve a list 
   * of ports, then logs the path, manufacturer, and 
   * serial number (if available) of each port to the console. 
   * If no ports are found, it logs a message indicating so. 
   * If an error occurs during the process, it logs the 
   * error to the console.
   * 
   * To call this static function from outside the class, 
   * you would use the class name followed by the 
   * function name, like this:
   * 
   * await SerialService.listSerialPorts();
   * or 
   * SerialService.listSerialPorts().then(() => {
   *   // do something
   * });
   * 
   * @returns 
   */
  static async listSerialPorts() {
    try {
      const ports = await SerialPort.list();
      if (ports.length === 0) {
        console.log("No serial ports detected.");
        return [];
      }
      console.log("Detected serial ports:");
      ports.forEach((port) => {
        console.log(
          `• ${port.path}` +
            (port.manufacturer ? ` — ${port.manufacturer}` : "") +
            (port.serialNumber ? ` (S/N: ${port.serialNumber})` : ""),
        );
      });
      return ports;
    } catch (err) {
      console.error("Error listing serial ports:", err);
    }
    return [];
  }
}

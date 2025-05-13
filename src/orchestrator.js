import BLEService from "./services/ble.js";
import WSService from "./services/ws.js";
import OSCService from "./services/osc.js";

export default class Orchestrator {
  constructor({ wsPort, oscHost, oscPort }) {
    this.ws = new WSService(wsPort);
    this.osc = new OSCService(oscHost, oscPort);
    this.bt = new BLEService();
  }

  /**
   * Start the orchestrator by initializing
   * WebSocket and Bluetooth services.
   */
  start() {
    // Listen for data events from the
    // WebSocket service.
    this.ws.on("data", (payload) => {
      const str = JSON.stringify(payload);
      console.log(`broadcast ws message: ${str}`);
    });

    // Start the WebSocket server.
    this.ws.start();

    // Listen for data events from
    // the Bluetooth service.
    this.bt.on("data", (payload) => {
      // Broadcast the payload over WebSocket.
      this.ws.broadcast(payload);

      // Extract UUID and data
      // from the payload.
      const uuid = payload.uuid;
      const v0 = payload.data;
      const v1 = [];

      // Append accelerometer data to the array.
      v1.push(...[v0.ax, v0.ay, v0.az]);

      // Append gyroscope data to the array.
      v1.push(...[v0.gx, v0.gy, v0.gz]);

      // Append orientation data to the array.
      v1.push(...[v0.roll, v0.pitch, v0.yaw]);

      // Send raw data via OSC.
      this.osc.send(`/pm/raw/${uuid}`, v1);
    });

    // Connect to Bluetooth devices.
    this.bt.connect();
  }

  async stop() {
    this.ws.close();
    this.osc.close();
  }
}

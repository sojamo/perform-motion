import BLEService from "./services/bleService.js";
import OSCService from "./services/oscService.js";
import WSService from "./services/wsService.js";
import WebService from "./services/webService.js";
import SerialService from "./services/serialService.js";
import OSCRoute from "./routes/oscRoute.js";
import SerialRoute from "./routes/serialRoute.js";

export default class Orchestrator {
  constructor({ wsPort, oscHost, oscPort, knownDevices }) {
    console.log(`
      Orchestrator init with
      wsPort: ${wsPort},
      oscHost: ${oscHost},
      oscPort: ${oscPort}
      `);

    this.bt = new BLEService(knownDevices);

    this.osc = new OSCService(oscHost, oscPort);
    this.oscRoute = new OSCRoute(this.osc);

    this.ws = new WSService(wsPort);
    this.web = new WebService(3000, "./public");
  }

  /**
   * Start the orchestrator by initializing
   * WebSocket and Bluetooth services.
   */
  start() {
    // Listen for data events from the
    // WebSocket service.
    this.ws.on("data", (thePayload) => {
      // console.log('← ws', thePayload);
    });

    // Listen for data events from
    // the Bluetooth service.
    this.bt.on("data", (thePayload) => {
      // Broadcast the payload over WebSocket
      // and OSC to connected clients.
      this.ws.broadcast({ source: "bt", data: thePayload });
      this.oscRoute.broadcast({ source: "bt", data: thePayload });
    });

    // Start the WebSocket server.
    this.ws.start();

    // Connect to Bluetooth devices.
    this.bt.start();

    this.web.start();
  }

  async stop() {
    this.ws.close();
    this.osc.close();
  }
}

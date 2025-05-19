import BLEService from "./services/bleService.js";
import OSCService from "./services/oscService.js";
import WSService from "./services/wsService.js";
import WebService from "./services/webService.js";
import SerialService from "./services/serialService.js";
import OSCRoute from "./routes/oscRoute.js";
import SerialRoute from "./routes/serialRoute.js";
import LightTestSerialComm from "./actions/light/lightTestSerialComm.js";
import LightFromWeb from "./actions/light/lightFromWeb.js";

export default class Orchestrator {
  constructor({
    wsPort,
    oscHost,
    oscPort,
    serialPort,
    serialBaudrate,
  }) {
    console.log(`
      Orchestrator init with 
      wsPort: ${wsPort}, 
      oscHost: ${oscHost}, 
      oscPort: ${oscPort}, 
      serialPort: ${serialPort}, 
      serialBaudrate: ${serialBaudrate}
      `);
    
    this.bt = new BLEService();
    
    this.osc = new OSCService(oscHost, oscPort);
    this.oscRoute = new OSCRoute(this.osc);

    this.serial = new SerialService(serialPort, serialBaudrate);
    this.serialRoute = new SerialRoute(this.serial);
    
    this.ws = new WSService(wsPort);
    this.web = new WebService(3000, "./public");

    this.lights = new LightFromWeb(this.serial, this.ws);
    
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

    // Listen for data events from
    // the Serial service.
    this.serial.on("data", (thePayload) => {
      this.oscRoute.broadcast({ source: "serial", data: thePayload });
      this.ws.broadcast({ source: "serial", data: thePayload });
      // this.oscRoute.broadcast({ source: "serial", data: thePayload });
    });

    // Start the WebSocket server.
    this.ws.start();

    // Connect to Bluetooth devices.
    this.bt.start();

    // Open serial connection.
    this.serial.start();

    
    this.web.start();

    this.lights.init();
  }

  async stop() {
    this.ws.close();
    this.osc.close();
  }
}

import BLEService from './services/ble.js';
import WSService from './services/ws.js';
import OSCService from './services/osc.js';
export default class Orchestrator {
  constructor({ wsPort, oscHost, oscPort }) {
    this.ws  = new WSService(wsPort);
    this.osc = new OSCService(oscHost, oscPort);
    this.bt  = new BLEService();
  }

  start() {
    this.ws.start();
    this.bt.on('data', (payload) => {
      this.ws.broadcast(payload);

      const uuid = payload.uuid;
      const v0 = payload.data;
      const v1 = [];
      
      v1.push(... [v0.ax, v0.ay, v0.az]);
      v1.push(... [v0.gx, v0.gy, v0.gz]);
      v1.push(... [v0.roll, v0.pitch, v0.yaw]);
      this.osc.send(`/pm/raw/${uuid}`, v1);
      
    });
    this.bt.connect();
  }

  async stop() {
    this.ws.close();
    this.osc.close();
  }
}
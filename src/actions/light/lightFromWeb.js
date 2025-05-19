import LightController from "./lightController.js";

export default class LightFromWeb extends LightController {
  constructor(theSerial, theWebSocket) {
    super(theSerial);

    this.dataSize = 7;
    this.frameInterval = 1000 / 50;
    this.delimiter = 255;
    this.val = 0;
    console.log(`
      LightFromWeb init with 
      frameInterval: ${this.frameInterval}ms, 
      dataSize: ${this.dataSize}, 
      delimiter: ${this.delimiter}
    `);

    this.ws = theWebSocket;
    this.ws.on("data", (thePayload) => {
      const source = thePayload.source || undefined;
      if (source === undefined) return;
      if (source === "ui") {
        const packet = Buffer.from(thePayload.data);
        this.serial.write(packet);
      }
    });
  }

  init() {}
}

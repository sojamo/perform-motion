import LightController from "./lightController.js";

export default class LightTestSerialComm extends LightController {
  constructor(serial) {
    super(serial);
    this.dataSize = 7;
    this.frameInterval = 1000/50;
    this.delimiter = 255;
    this.val = 0;
    console.log(`
      LightTestSerialComm init with 
      frameInterval: ${this.frameInterval}ms, 
      dataSize: ${this.dataSize}, 
      delimiter: ${this.delimiter}
    `); 
  }

  init() {
    setTimeout(() =>
      setInterval(
        this.sendRandomPacket,
        this.frameInterval,
        this,
      ), 1333);
  }

  sendRandomPacket(theParent) {
    // 'theParent' is needed because setInterval's 
    // callback loses the class context, so we explicitly 
    // pass 'this' (the instance) to maintain access 
    // to instance properties.
    const packet = Buffer.alloc(theParent.dataSize + 1);
    for (let i = 0; i < theParent.dataSize; i++) {
      packet[i] = ((++theParent.val * 0.5) + i * 5) % (theParent.delimiter - 1);
    }
    packet[theParent.dataSize] = theParent.delimiter;
    theParent.serial.write(packet);
  }
  
}

export default class SerialRoute {
  constructor(theSerialService) {
    this.serial = theSerialService;
  }

  broadcast(thePayload) {
    console.log(`serial data: ${thePayload}`);
  }
}

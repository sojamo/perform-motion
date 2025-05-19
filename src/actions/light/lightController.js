export default class LightController {

  constructor(serial) {
    this.serial = serial;
  }

  init() {
    throw new Error('init() must be implemented');
  }
}

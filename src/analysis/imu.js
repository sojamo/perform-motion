export default class IMUAnalysis {

  constructor() {}

  getSignInt16(value) {
    // If the highest bit (0x8000) is set, the value is negative.
    return (value & 0x8000) ? value - 0x10000 : value;
  }

  analyse(theUUID, theBytes) {
    // Assuming "Bytes" is an array (or Buffer) of bytes 
    // where each element is a number (0-255)
    const Bytes = theBytes;

    // Extract and compute values similar to the Python version:
    // Note: Bytes indices are assumed to be in the same order as in the Python code.
    // https://github.com/Keio-CSG/witmotion_visualizer/blob/main/wit_motion_sensor.py

    const ax = this.getSignInt16((Bytes[3] << 8) | Bytes[2]) / 32768 * 16;// * 9.8;
    const ay = this.getSignInt16((Bytes[5] << 8) | Bytes[4]) / 32768 * 16;// * 9.8;
    const az = this.getSignInt16((Bytes[7] << 8) | Bytes[6]) / 32768 * 16;// * 9.8;

    const gx = this.getSignInt16((Bytes[9] << 8) | Bytes[8]) / 32768 * 2000;
    const gy = this.getSignInt16((Bytes[11] << 8) | Bytes[10]) / 32768 * 2000;
    const gz = this.getSignInt16((Bytes[13] << 8) | Bytes[12]) / 32768 * 2000;

    const roll = this.getSignInt16((Bytes[15] << 8) | Bytes[14]) / 32768 * 180;
    const pitch = this.getSignInt16((Bytes[17] << 8) | Bytes[16]) / 32768 * 180;
    const yaw = this.getSignInt16((Bytes[19] << 8) | Bytes[18]) / 32768 * 180;

    const croll = roll * Math.PI / 180;
    const cpitch = pitch * Math.PI / 180;
    const cyaw = yaw * Math.PI / 180;
    const current = { croll, cpitch, cyaw };
    const result = { ax, ay, az, gx,gy,gz, roll, pitch, yaw, current };
    
    return result;
  }
}
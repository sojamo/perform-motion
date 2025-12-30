import dotenv from "dotenv";
dotenv.config();

// NOTE:
// the following knownDevices are mac-device-specific
// Apple’s CoreBluetooth API simply doesn’t expose the real
// BLE hardware address for privacy reasons. Hence we are using
// the uuid generated internally instead.
// When using this application on a different macbook, these
// uuids will be different and will need to be updated.
// for now we will include uuids for both macbooks
const knownDevices = new Map();
knownDevices.set("abb335a50ff81ba0ce8ea399421e0482", 1); // a.
knownDevices.set("2b0681ec608da8ae7cda8b8cd42c375d", 2); // a.
knownDevices.set("7ce331532d7087440b2754705259b0be", 3); // a.
knownDevices.set("61c25f1db62f8b897c546d7a07a3c38f", 4); // a.
knownDevices.set("cf27adcf076c47d2bcd071f3ef2e93b5", 1); // ray old-laptop
knownDevices.set("99025e9d50fe47e59a40a6091cc1fbb7", 2); // ray old-laptop
knownDevices.set("1", 1); // ray new-laptop
knownDevices.set("2", 2); // ray new-laptop
knownDevices.set("3", 3); // ray new-laptop
knownDevices.set("4", 4); // ray new-laptop

export default {
  wsPort: +process.env.WS_PORT || 4000,
  oscPort: +process.env.OSC_PORT || 12000,
  oscHost: process.env.OSC_HOST || "127.0.0.1",
  serialPort: process.env.SERIAL_DEVICE || "",
  serialBaudrate: +process.env.BAUDRATE || 57600,
  knownDevices: knownDevices,
};

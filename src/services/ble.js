import noble from "@abandonware/noble";
import EventEmitter from "events";
import IMUAnalysis from "../analysis/imu.js";

export default class BLEService extends EventEmitter {
  constructor() {
    super();
    this.discoveredDevices = new Set();
    this.witmotion = new Map();
    this.nameFilter = "WT901BLE67";
    this.imu = new IMUAnalysis();
    this.knownDevices = new Map();

    // NOTE:
    // the following knownDevices are mac-device-specific
    // Apple’s CoreBluetooth API simply doesn’t expose the real 
    // BLE hardware address for privacy reasons. Hence we are using
    // the uuid generated internally instead.
    // When using this application on a different macbook, these
    // uuids will be different and will need to be updated.
    // for now we will include uuids for both macbooks

    this.knownDevices.set('abb335a50ff81ba0ce8ea399421e0482', 1); // a.
    this.knownDevices.set('2b0681ec608da8ae7cda8b8cd42c375d', 2); // a.
    this.knownDevices.set('7ce331532d7087440b2754705259b0be', 3); // a.
    this.knownDevices.set('61c25f1db62f8b897c546d7a07a3c38f', 4); // a.
    this.knownDevices.set('cf27adcf076c47d2bcd071f3ef2e93b5', 1); // r.
    this.knownDevices.set('99025e9d50fe47e59a40a6091cc1fbb7', 2); // r.
  }

  // Initialize noble event listeners
  connect() {
    noble.on("stateChange", (state) => this._handleStateChange(state));
    noble.on("discover", (peripheral) => this._handleDiscover(peripheral));
  }

  // Handle Bluetooth adapter state changes
  _handleStateChange(state) {
    if (state === "poweredOn") {
      console.log("Starting BLE scan...");
      noble.startScanning([], false);
    } else {
      noble.stopScanning();
      console.log("Stopped BLE scan.");
    }
  }

  // Process discovered peripherals
  _handleDiscover(peripheral) {
    const { uuid, rssi, advertisement } = peripheral;
    const name = advertisement.localName || "Unnamed Device";

    if (this.discoveredDevices.has(uuid)) {
      // console.log(`Already discovered: ${name} (${uuid})`);
      return;
    }

    this.discoveredDevices.add(uuid);
    if (this.debug) {
      console.log(`New device found: ${name} (${uuid}), RSSI: ${rssi}`);
    }

    // Filter for your specific device
    if (name.includes(this.nameFilter)) {
      console.log(`\n\tWe are connecting to sensor ${name} with uuid (${uuid})\n`);
      this._connectAndRead(peripheral);
    }
  }

  // Example handler for incoming data
  _onData(deviceUuid, data) {
    // parse data buffer and emit or store
    console.log(`Data from ${deviceUuid}:`, data);
  }

  /**
   * Stop scanning and disconnect all connected devices.
   */
  async shutdown() {
    noble.stopScanning();
    for (const [deviceUuid, device] of this.witmotion) {
      try {
        await device.disconnect();
      } catch (error) {
        console.error(`Error disconnecting ${deviceUuid}`, error);
      }
    }
  }


  /**
   * Connect to the peripheral, read data from it, and enable notifications.
   *
   * @param {noble.Peripheral} peripheral - The peripheral to connect to.
   * @returns {Promise<void>} A promise that resolves when the peripheral is connected and
   * notifications are enabled for the relevant characteristics.
   */
  async _connectAndRead(peripheral) {
    const peripheralUuid = peripheral.uuid;

    if (this.witmotion.has(peripheralUuid)) return;

    this.witmotion.set(peripheralUuid, peripheral);

    try {
      await peripheral.connectAsync();
      console.log(`Connected to device: ${peripheral.advertisement.localName}`);

      // Discover services
      const services = await peripheral.discoverServicesAsync([]);
      for (const service of services) {
        console.log(`Discovered service: ${service.uuid}`);
        // Discover characteristics
        const characteristics = await service.discoverCharacteristicsAsync([]);

        for (const characteristic of characteristics) {
          console.log(`Characteristic UUID: ${characteristic.uuid}`);

          // Enable notifications for characteristics that support it
          if (characteristic.properties.includes("notify")) {
            await characteristic.subscribeAsync();
            console.log(`Subscribed to notifications: ${characteristic.uuid}`);

            // Handle incoming data from the characteristic
            characteristic.on("data", (data, isNotification) => {
              if (!isNotification) return;

              this.broadcast(peripheral, data);
            });
          }

          // Read value directly from characteristics that support it
          if (characteristic.properties.includes("read")) {
            try {
              const data = await characteristic.readAsync();
              console.log(
                `Read data from ${characteristic.uuid}:`,
                data.toString("hex"),
              );
            } catch (readErr) {
              console.error("Read error:", readErr);
            }
          }
        }
      }

      // Handle disconnections
      peripheral.on("disconnect", () => {
        console.log(`Device disconnected. ${peripheral.uuid}`);
        this.discoveredDevices.delete(peripheralUuid);
        this.witmotion.delete(peripheralUuid);
        noble.startScanning([], false);
      });
    } catch (err) {
      console.error("Error during connectAndRead:", err);
    }
  }

  broadcast(thePeripheral, theData) {
    const uuid = thePeripheral.uuid;
    const dataProcessed = this.imu.analyse(uuid, theData);
    const id = this.knownDevices.get(uuid) || 0;
    this.emit("data", { uuid: id, data: dataProcessed });
  }

}

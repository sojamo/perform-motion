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
    this.knownDevices.set('abb335a50ff81ba0ce8ea399421e0482', 1);
    this.knownDevices.set('2b0681ec608da8ae7cda8b8cd42c375d', 2);
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
      console.log(`\n\tConnecting to ${name} (${uuid})\n`);
      this._connectAndRead(peripheral);
    }
  }

  // Example handler for incoming data
  _onData(deviceUuid, data) {
    // parse data buffer and emit or store
    console.log(`Data from ${deviceUuid}:`, data);
  }

  /**
   * Stop scanning and disconnect all known devices
   */
  async shutdown() {
    noble.stopScanning();
    for (const [uuid, peripheral] of this.witmotion) {
      try {
        await peripheral.disconnectAsync();
        console.log(`Disconnected: ${uuid}`);
      } catch (e) {
        console.warn(`Error disconnecting ${uuid}:`, e);
      }
    }
  }


  // Connect and read data from the peripheral
  async _connectAndRead(peripheral) {
    const uuid = peripheral.uuid;
    if (this.witmotion.has(uuid)) return;

    this.witmotion.set(uuid, peripheral);
    console.log(`${uuid} ${peripheral.advertisement.localName}`);

    try {
      await peripheral.connectAsync();
      console.log(`Connected to device: ${peripheral.advertisement.localName}`);

      const services = await peripheral.discoverServicesAsync([]);
      for (const service of services) {
        console.log(`Discovered service: ${service.uuid}`);
        const characteristics = await service.discoverCharacteristicsAsync([]);

        for (const characteristic of characteristics) {
          console.log(`Characteristic UUID: ${characteristic.uuid}`);

          // Enable notifications if characteristic supports it
          if (characteristic.properties.includes("notify")) {
            await characteristic.subscribeAsync();
            console.log(`Subscribed to notifications: ${characteristic.uuid}`);

            characteristic.on("data", (data, isNotification) => {
              if (!isNotification) return;

              const result = this.imu.analyse(uuid, data);
              const id = this.knownDevices.get(uuid) || 0;
              this.emit("data", { uuid: id, data: result });

              const header = data.readUInt8(0).toString(16);
              const frameType = data.readUInt8(1).toString(16);
              // console.log(`\nuuid: ${uuid} header:${header} frameType:${frameType} ${this.witmotion.size}`);
              
              if (this.debug) {
                console.log(`Data from ${characteristic.uuid}:`, dataHex);
                console.log(`header:${header} frameType:${frameType}`);
              }
            });
          }

          // Read value directly if supported
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

      peripheral.on("disconnect", () => {
        console.log(`Device disconnected. ${peripheral.uuid}`);
        this.discoveredDevices.delete(peripheral.uuid);
        this.witmotion.delete(peripheral.uuid);
        noble.startScanning([], false);
      });
    } catch (err) {
      console.error("Error during connectAndRead:", err);
    }
  }

}

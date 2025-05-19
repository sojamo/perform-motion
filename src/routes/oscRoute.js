export default class OSCRoute {
  constructor(theOscService) {
    this.osc = theOscService;
  }

  broadcast(thePayload) {
    const { source, uuid, data } = thePayload;

    if (source === "bt") {
      // Extract values with fallback to
      // NaN for missing fields
      // 0-2 Append accelerometer data
      // 3-5 Append gyroscope data
      // 6-8 Append orientation data
      const values = [
        data.data.ax, 
        data.data.ay,
        data.data.az,
        data.data.gx,
        data.data.gy,
        data.data.gz,
        data.data.roll,
        data.data.pitch,
        data.data.yaw,
      ];

      // Validate all values are numbers
      if (!values.every((val) => typeof val === "number" && !isNaN(val))) {
        console.warn("BT data contains non-numeric values:", values);
        return;
      }

      // Send raw data via OSC.
      this.osc.send(`/pm/raw/${uuid}`, values);
    } else if (thePayload.source === "serial") {
      this.osc.send("/pm/serial", thePayload.data);
    } else {
      // Log unsupported source types
      console.warn("Unknown source type:", source, thePayload);
    }
  }
}

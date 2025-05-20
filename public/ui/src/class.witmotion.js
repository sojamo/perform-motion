class WitMotion {
  constructor(theUUID) {
    this.uuid = theUUID;
    this.data = { roll: 0, pitch: 0, yaw: 0 };
    this.history = {
      raw: {
        roll: [],
        pitch: [],
        yaw: [],
        ax: [],
        ay: [],
        az: [],
      },
      filtered: {
        roll: [],
        pitch: [],
        yaw: [],
      },
    };

    /* Example usage:
       Suppose your system provides computed orientation as Euler angles:
       roll, pitch, yaw (all in radians). We create a filter for each.
       You can adjust R and Q based on your system’s noise characteristics.
    */
    this.R = 0.01; // Measurement noise covariance (tweak as needed)
    this.Q = 0.001; // Process noise covariance (tweak as needed)

    // Initialize filters for each Euler angle (roll, pitch, yaw)
    this.rollFilter = new AngleFilter(this.R, this.Q, 0);
    this.pitchFilter = new AngleFilter(this.R, this.Q, 0);
    this.yawFilter = new AngleFilter(this.R, this.Q, 0);
  }

  // A function to update the filtered Euler angles
  updateOrientation(rawRoll, rawPitch, rawYaw) {
    const filteredRoll = this.rollFilter.update(rawRoll);
    const filteredPitch = this.pitchFilter.update(rawPitch);
    const filteredYaw = this.yawFilter.update(rawYaw);
    return { roll: filteredRoll, pitch: filteredPitch, yaw: filteredYaw };
  }

  interact(rawRoll, rawPitch, rawYaw, output = false) {
    // Update filtered angles
    const filtered = this.updateOrientation(rawRoll, rawPitch, rawYaw);

    this.pushWithLimit(this.history.raw.roll, rawRoll);
    this.pushWithLimit(this.history.raw.pitch, rawPitch);
    this.pushWithLimit(this.history.raw.yaw, rawYaw);

    this.pushWithLimit(this.history.filtered.roll, filtered.roll);
    this.pushWithLimit(this.history.filtered.pitch, filtered.pitch);
    this.pushWithLimit(this.history.filtered.yaw, filtered.yaw);

    if (output) console.log("Filtered Orientation:", filtered);
    return filtered;
  }

  /**
   * Adds a new item to the array and removes the oldest 
   * item if the array exceeds the specified limit.
   * Adds new items to the end and removes from the beginning
   * 
   * @param {Array} n - The array to which the new item is added.
   * @param {*} newItem - The new item to be added to the array.
   * @param {number} [limit=100] - The maximum number of items allowed in the array.
   */
  pushWithLimit(n, newItem, limit = 100) {
    n.push(newItem);
    if (n.length > limit) {
      n.shift();
    }
  }

  /**
   * Set the current data from the sensor and
   * store the newest acceleration data in the history.
   * 
   * @param {Object} theData - The current sensor data.
   */
  setData(theData) {
    this.data = theData;
    this.pushWithLimit(this.history.raw.ax, this.data.ax);
    this.pushWithLimit(this.history.raw.ay, this.data.ay);
    this.pushWithLimit(this.history.raw.az, this.data.az);
  }

  /**
   * Return the current data of the sensor.
   * Data here is the raw data from the sensor including its history
   * 
   * @return {Object} The current sensor data.
   */
  getData() {
    return this.data;
  }
}

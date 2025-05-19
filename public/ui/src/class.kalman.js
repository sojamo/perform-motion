// A basic Kalman Filter for scalar values.
class KalmanFilter {
  /**
   * @param {number} R - Measurement noise covariance.
   * @param {number} Q - Process noise covariance.
   * @param {number} initialEstimate - The starting value.
   */
  constructor(R, Q, initialEstimate) {
    this.R = R; // Measurement noise
    this.Q = Q; // Process noise
    this.x = initialEstimate; // State estimate
    this.P = 1.0; // Error covariance
  }

  /**
   * Update the filter with a new measurement.
   * @param {number} measurement - The new measurement.
   * @returns {number} - The updated filtered value.
   */
  update(measurement) {
    // Prediction step (no control input, so we keep the same state)
    this.P = this.P + this.Q;

    // Kalman Gain
    const K = this.P / (this.P + this.R);

    // Update estimate with measurement
    this.x = this.x + K * (measurement - this.x);

    // Update error covariance
    this.P = (1 - K) * this.P;
    return this.x;
  }
}

/**
 * AngleFilter ties a KalmanFilter with angle unwrapping.
 * @param {number} R - Measurement noise covariance.
 * @param {number} Q - Process noise covariance.
 * @param {number} initialAngle - Initial angle in radians.
 */
class AngleFilter {
  constructor(R, Q, initialAngle) {
    this.kf = new KalmanFilter(R, Q, initialAngle);
    this.prevAngle = initialAngle;
  }

  /**
   * Update the filter with a new angle measurement.
   * The measurement is first unwrapped relative to the previous filtered angle.
   * @param {number} newAngle - The new measured angle in radians.
   * @returns {number} - The filtered and unwrapped angle.
   */
  update(newAngle) {
    // Unwrap the new angle relative to the last filtered angle.
    newAngle = this.unwrapAngle(this.prevAngle, newAngle);
    const filteredAngle = this.kf.update(newAngle);
    this.prevAngle = filteredAngle;
    return filteredAngle;
  }

  /**
   * Unwraps the current angle relative to the previous angle measurement.
   * This ensures the angle difference is computed correctly across the wrap-around at 2π.
   * @param {number} previous - The previous (filtered) angle in radians.
   * @param {number} current - The new measured angle in radians.
   * @returns {number} - The unwrapped current angle.
   */
  unwrapAngle(previous, current) {
    let diff = current - previous;
    let isWrap = false;
    // Adjust if the difference is greater than π
    while (diff > Math.PI) {
      current -= 2 * Math.PI;
      diff = current - previous;
    }
    // Adjust if the difference is less than -π
    while (diff < -Math.PI) {
      current += 2 * Math.PI;
      diff = current - previous;
    }

    return current;
  }
}

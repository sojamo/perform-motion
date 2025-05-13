// A basic Kalman Filter for scalar values.
export default class KalmanFilter {
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

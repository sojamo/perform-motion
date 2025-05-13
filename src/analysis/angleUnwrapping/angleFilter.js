import KalmanFilter from "./kalmanFilter.js";
/**
 * AngleFilter ties a KalmanFilter with angle unwrapping.
 * @param {number} R - Measurement noise covariance.
 * @param {number} Q - Process noise covariance.
 * @param {number} initialAngle - Initial angle in radians.
 */
export default class AngleFilter {
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
    newAngle = unwrapAngle(this.prevAngle, newAngle);
    const filteredAngle = this.kf.update(newAngle);
    this.prevAngle = filteredAngle;
    return filteredAngle;
  }
}

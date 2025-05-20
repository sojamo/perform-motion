class AnalyseData {
  constructor() {
    this.analysisWindow = 20; // window of how many data points should be analysed
  }

  process(theWitmotions, theParams) {
    const report = [];
    this._analyseAcceleration(report, theWitmotions, theParams);
    return report;
  }

  _analyseAcceleration(theReport, theWitmotions, theParams) {
    const witId = 3;
    const wit = theWitmotions.get(witId);
    if (wit === undefined) return;

    theReport.push({ "desc": "witId", "value": int(witId) });

    const azHistory = wit.history.raw.az;
    const newAz = azHistory[azHistory.length - 1];

    if (azHistory.length > this.analysisWindow) {
      const delta = Math.abs(newAz - azHistory[azHistory.length - 2]);
      if (delta > 2) {
        theReport.push({ "desc": "spike-Z", "value": delta });
      } else {
        theReport.push({ "desc": "spike-Z", "value": 0 });
      }

      // 1. get Sign changes to detect oscillations
      // console.log("Sign changes:", this._countSignChanges(wit.history.raw.ax));

      // 2. Analyse oscillation
      const sampleInterval = 0.2; // 1/sampleRate (e.g., 1/5s)
      const history = wit.history.raw.ay.map((v, i) => ({
        value: v,
        timestamp: i * sampleInterval,
      }));
      const result = this._analyseOscillation(history);
      // console.log(`Freq: ${result.frequency} Amplitude: ${result.amplitude}`);
    }

    // Example usage:
    const arr = wit.history.raw.ay;
    const { peaks, troughs } = this._detectPeaksAndTroughs(arr);

    // Estimate frequency (if you know the sample rate):
    const sampleRate = 5; // Hz (5 samples per second)
    let cyclePeriods = [];
    for (let i = 1; i < peaks.length; i++) {
      cyclePeriods.push((peaks[i].index - peaks[i - 1].index) / sampleRate);
    }
    const avgPeriod = cyclePeriods.length
      ? cyclePeriods.reduce((a, b) => a + b, 0) / cyclePeriods.length
      : 0;
    const frequency = avgPeriod > 0 ? 1 / avgPeriod : 0;

    // Estimate amplitude as average peak-to-trough
    let amplitudes = [];
    for (let i = 0; i < Math.min(peaks.length, troughs.length); i++) {
      amplitudes.push(Math.abs(peaks[i].value - troughs[i].value) / 2);
    }
    const avgAmplitude = amplitudes.length
      ? amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length
      : 0;

    theReport.push({ "desc": "oscillation-freq", "value": frequency });
    theReport.push({ "desc": "oscillation-amp", "value": avgAmplitude });
    theReport.push({ "desc": "oscillation-peaks", "value": peaks });
    theReport.push({ "desc": "oscillation-troughs", "value": troughs });

    // Determine update rate based on acceleration
    const arrX = wit.history.raw.ay.slice(-4);
    const avgX = arrX.reduce((sum, val) => sum + val, 0) / arrX.length;
    theParams.updateRate.next = abs(avgX) * 4;

    const arrY = wit.history.raw.ay.slice(-10);
    const avgY = arrY.reduce((sum, val) => sum + val, 0) / arrY.length;
    theParams.intensity = map(avgY * -1, 0.2, 0.7, 0, 1, true);

    const arrZ = wit.history.raw.az.slice(-1);
    theParams.mode = arrZ < 0 ? 0 : 1;

    // Determine orientation
    const v0 = wit.interact(
      radians(wit.getData().roll),
      radians(wit.getData().pitch),
      radians(wit.getData().yaw),
    );
    const rx = (v0.roll % Math.PI * 2).toFixed(2);
    const ry = (v0.pitch % Math.PI * 2).toFixed(2);
    const rz = (v0.yaw % Math.PI * 2).toFixed(2);
    theReport.push({ "desc": `witmotion-${witId} roll`, "value": rx });
    theReport.push({ "desc": `witmotion-${witId} pitch`, "value": ry });
    theReport.push({ "desc": `witmotion-${witId} yaw`, "value": rz });
  }

  _countSignChanges(arr) {
    let count = 0;
    let start = arr.length - 10;
    let end = arr.length;
    for (let i = start; i < end; i++) {
      if (
        Math.sign(arr[i]) !== 0 && Math.sign(arr[i]) !== Math.sign(arr[i - 1])
      ) {
        count++;
      }
    }
    return count;
  }

  // Assumptions: history = array of {value, timestamp} for one axis
  _analyseOscillation(history, minAmplitude = 0.1) {
    let crossings = [];
    let prev = history[0].value;
    let prevTime = history[0].timestamp;
    let prevSign = Math.sign(prev);

    let start = history.length - 10;
    let end = history.length;

    // 1. Find all sign crossings (zero crossings)
    for (let i = start; i < end; i++) {
      const curr = history[i].value;
      const currTime = history[i].timestamp;
      const currSign = Math.sign(curr);

      if (currSign !== 0 && currSign !== prevSign) {
        // Save the time and value of crossing
        crossings.push({ index: i, timestamp: currTime });
      }
      prevSign = currSign;
    }

    // 2. Each pair of crossings is (roughly) one half-period
    if (crossings.length < 2) return { frequency: 0, amplitude: 0 };

    // Frequency: full period is two crossings
    let periods = [];
    for (let i = 2; i < crossings.length; i += 2) {
      const t0 = crossings[i - 2].timestamp;
      const t1 = crossings[i].timestamp;
      periods.push(t1 - t0); // full cycle duration
    }
    const avgPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;
    const frequency = avgPeriod > 0 ? 1 / avgPeriod : 0;

    // 3. Amplitude: look for peaks between crossings (local maxima/minima)
    let amplitudes = [];
    for (let i = 1; i < crossings.length; i += 2) {
      const i0 = crossings[i - 1].index;
      const i1 = crossings[i].index;
      const segment = history.slice(i0, i1 + 1).map((pt) => pt.value);
      const min = Math.min(...segment);
      const max = Math.max(...segment);
      const amp = (max - min) / 2;
      if (amp >= minAmplitude) amplitudes.push(amp);
    }
    const avgAmplitude = amplitudes.length
      ? amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length
      : 0;

    return { frequency, amplitude: avgAmplitude };
  }

  _detectPeaksAndTroughs(arr, threshold = 0.1) {
    let peaks = [];
    let troughs = [];
    let start = arr.length - this.analysisWindow;
    let end = arr.length - 1;
    for (let i = start; i < end; i++) {
      // Peak: higher than neighbors by at least threshold
      if (
        arr[i] > arr[i - 1] && arr[i] > arr[i + 1] &&
        (arr[i] - Math.min(arr[i - 1], arr[i + 1]) > threshold)
      ) {
        peaks.push({ index: i, value: arr[i] });
      }
      // Trough: lower than neighbors by at least threshold
      if (
        arr[i] < arr[i - 1] && arr[i] < arr[i + 1] &&
        (Math.max(arr[i - 1], arr[i + 1]) - arr[i] > threshold)
      ) {
        troughs.push({ index: i, value: arr[i] });
      }
    }
    return { peaks, troughs };
  }
}

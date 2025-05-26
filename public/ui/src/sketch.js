const witmotions = new Map();

let analyse;
let render;
let comms;
let ui;

const output = {
  size: 7,
  delimiter: 255,
  data: [],
  layers: [],
};

const params = {
  intensity: 0,
  updateRate: { current: 1, next: 1 },
  update: 0,
  mode: 0,
  lights: [],
};

const control = {
  mode: 0, // 0 = keyboard-control, 1 = sensor-controlled, 2 = automatic
  preset: {
    current: [0, 0, 0, 0, 0, 0, 0],
    off: [0, 0, 0, 0, 0, 0, 0],
    on: [254, 254, 254, 254, 254, 254, 254],
  },
};

function preload() {
  font = loadFont("./src/assets/MonaspaceNeonFrozen-Medium.ttf");
  automatedScore = loadImage("./src/assets/images/automated-0.jpg"); 
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("p5-container");
  background(0);
  textFont(font);

  comms = new SocketCommunication(this);
  analyse = new AnalyseData();
  render = new Render();
  ui = new UIbridge();
  auto = new Automated(automatedScore);
}

/**
 * Event handler for incoming data from
 * the WebSocket server. Updates the witmotions
 * registered in the sketch with the new data
 *
 * @param {string} event - The event type
 * @param {object} data - The data object
 * @property {string} uuid - The uuid of the Witmotion device that sent the data
 * @property {object} data - The raw data object from the device
 */
function on(event, data) {
  if (event === "data") {
    if (!witmotions.has(data.uuid)) {
      const witmotion = new WitMotion(data.uuid);
      witmotions.set(data.uuid, witmotion);
    }
    const witmotion = witmotions.get(data.uuid);
    witmotion.setData(data.data);
  }
}

function draw() {
  // Note: the following is absolutely messy
  // and needs to be refactored and cleaned up
  // for better readability and maintainability!

  update();

  let currentOutput = control.preset.off;
  let packet = { source: "ui", data: currentOutput };
  if (control.mode == 0) {
    // assign current preset when we are
    // in User Interface mode to control
    // the state of lights manually
    currentOutput = control.preset.current;
  } else if (control.mode == 1) {
    // compute the current light output
    // based on sensor data
    currentOutput = computeLightsFrom(output);
  } else if (control.mode == 2) {
    // compute the current light output
    // based on automated playback
    currentOutput = auto.compute(output);
  }

  // add delimiter to end of packet
  currentOutput[output.size] = output.delimiter;
  // assign packet data
  packet.data = currentOutput;
  // send packet
  comms.send(packet);

  const report = analyse.process(witmotions, params);
  ui.send("data-report", report);

  if (ui.actionTriggered === true) {
    background(40);
  } else {
    render.draw(this, witmotions);
    if(control.mode === 2) {
      auto.draw(this);
    }
  }

  render.lights(this, currentOutput);

  push();
  translate(-width / 2, -height / 2);
  fill(255);
  const txt = `mode : ${
    ["keyboard-control", "sensor-controlled", "automatic"][control.mode]
  }`;
  text(txt, 20, 20);
  pop();
}

/**
 * Compute the current light values based on
 * the current mode and intensity.
 *
 * This function will not send any data if
 * the WebSocket connection is not open.
 *
 * @returns {array} The computed light data
 */
function computeLightsFrom(theOutput) {
  if (params.mode === 0) {
    for (let i = 0; i < theOutput.size; i++) {
      theOutput.data[i] = int(random(0, 1) > 0.8 ? 254 : 0);
    }
  } else if (params.mode === 1) {
    for (let i = 0; i < theOutput.size; i++) {
      const v0 = ((params.update * 4) + i * 5) % (theOutput.delimiter - 1);
      const v1 = v0 * params.intensity;
      theOutput.data[i] = int(v1);
    }
  }

  return theOutput.data;
}

function update() {
  // Note: the following is a bit hacky and cryptic,
  // needs to be cleaned up and needs coments
  const delta = params.updateRate.next - params.updateRate.current;
  params.updateRate.current += delta * 0.1;
  params.update += params.updateRate.current;
}

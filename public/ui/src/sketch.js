const witmotions = new Map();

let analyse;
let render;
let comms;

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
  mode: 0, // 0 = keyboard-control, 1 = sensor-controlled
  output: {
    current: [0, 0, 0, 0, 0, 0, 0, 255],
    off: [0, 0, 0, 0, 0, 0, 0, 255],
    on: [254, 254, 254, 254, 254, 254, 254, 255],
  },
};

function preload() {
  font = loadFont("./src/assets/MonaspaceNeonFrozen-Medium.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);
  textFont(font);

  comms = new SocketCommunication(this);
  analyse = new AnalyseData();
  render = new Render();
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
  const report = analyse.process(witmotions, params);
  render.draw(this, witmotions);
  render.drawReport(this, report);

  update();

  let output = control.output.off;
  let packet = { source: "ui", data: output };
  if (control.mode == 1) {
    output = computeLights();
  } else if (control.mode == 0) {
    output = control.output.current;
  }
  packet.data = output;
  console.log(packet);
  comms.send(packet);
}

function computeLights() {
  if (comms.readyState() !== WebSocket.OPEN) return;

  if (params.mode === 0) {
    for (let i = 0; i < output.size; i++) {
      output.data[i] = int(random(0, 1) > 0.8 ? 254 : 0);
    }
  } else if (params.mode === 1) {
    for (let i = 0; i < output.size; i++) {
      const v0 = ((params.update * 4) + i * 5) % (output.delimiter - 1);
      const v1 = v0 * params.intensity;
      output.data[i] = int(v1);
    }
  }

  output.data[output.size] = output.delimiter;
  return output.data;
}

function update() {
  const delta = params.updateRate.next - params.updateRate.current;
  params.updateRate.current += delta * 0.1;
  params.update += params.updateRate.current;
}

function keyPressed() {
  switch (key) {
    case (" "):
      control.mode = control.mode == 0 ? 1 : 0;
      break;
    case ("0"):
      control.output.current = control.output.off;
      break;
    case ("1"):
      control.output.current = control.output.on;
      break;
  }
}

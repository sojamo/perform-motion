const witmotions = new Map();

let analyse;
let render;
let comms;

const params = {
  intensity: 0,
  updateRate: { current: 1, next: 1 },
  update: 0,
  mode: 0,
};

function preload() {
  font = loadFont("./src/assets/MonaspaceNeonFrozen-Medium.ttf");
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("p5-container");
  background(0);
  textFont(font);

  comms = new SocketCommunication(this);
  analyse = new AnalyseData();
  render = new Render();
}

/**
 * Event handler for incoming data from
 * the WebSocket server. Updates the witmotions
 * registered with this sketch
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

  push();
  // translate(-width / 2, 0);
  render.draw(this, witmotions);
  pop();
}

function update() {
  // @NOTE the following is a bit hacky and cryptic,
  // needs to be cleaned up and needs coments
  const delta = params.updateRate.next - params.updateRate.current;
  params.updateRate.current += delta * 0.1;
  params.update += params.updateRate.current;

  // @NOTE we are currently not sending
  // any data to a websocket server but
  // keeping this here for future reference
  // See branch perform-auto-play
  packet = {};
  comms.send(packet); // send packet

  const report = analyse.process(witmotions, params);
  // console.log(report);
}

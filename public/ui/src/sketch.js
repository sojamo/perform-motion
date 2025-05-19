let comms;
const witmotions = new Map();

const output = {
  size: 7,
  delimiter: 255,
  data: [],
};

const params = {
  intensity: 0,
  updateRate: { current: 1, next: 1 },
  update: 0,
  mode:0,
  lights: [],
};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);
  comms = new SocketCommunication(this);
}

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
  render();
  computeLights();
  updateLights();
}

function updateLights() {
  if (comms.readyState() !== WebSocket.OPEN) return;

  if(params.mode === 0) {
    for (let i = 0; i < output.size; i++) {
      output.data[i] = int(random(0,1)>0.8 ? 254:0);
    }
  } else if(params.mode === 1) {
    for (let i = 0; i < output.size; i++) {
      const v0 = ((params.update * 4) + i * 5) % (output.delimiter - 1);
      const v1 = v0 * params.intensity;
      output.data[i] = int(v1);
    }  
  }
  
  output.data[output.size] = output.delimiter;
  const packet = { source: "ui", data: output.data };
  comms.send(packet);
}

function computeLights() {
  const delta = params.updateRate.next - params.updateRate.current;
  params.updateRate.current += delta * 0.1;
  params.update += params.updateRate.current;

  const wit = witmotions.get(4);
  if (wit === undefined) return;

  const arrX = wit.history.raw.ay.slice(-4);
  const avgX = arrX.reduce((sum, val) => sum + val, 0) / arrX.length;
  params.updateRate.next = abs(avgX) * 4;

  const arrY = wit.history.raw.ay.slice(-10);
  const avgY = arrY.reduce((sum, val) => sum + val, 0) / arrY.length;
  params.intensity = map(avgY * -1, 0.2, 0.7, 0, 1, true);

  const arrZ = wit.history.raw.az.slice(-1);
  params.mode = arrZ<0 ? 0 : 1;

  const v0 = wit.interact(
    radians(wit.getData().roll),
    radians(wit.getData().pitch),
    radians(wit.getData().yaw),
  );
 // console.log(v0.yaw%TWO_PI)
}

function render() {
  background(0);
  lights();
  noStroke();
  push();

  witmotions.forEach((v, k) => {
    const data = v.getData();
    const v0 = v.interact(
      radians(data.roll),
      radians(data.pitch),
      radians(data.yaw),
    );
    push();
    rotateX(v0.roll);
    rotateZ(v0.pitch);
    rotateY(v0.yaw);
    const minSize = 50;
    // box(minSize + data.gx, minSize + data.gy, minSize + data.gz);
    box(100);
    pop();
    translate(200, 0);
  });
  pop();
  push();
  translate(-width / 2, -height / 2);
  translate(100, 100);

  drawGraphFor("raw", "ax", color(255, 0, 0));
  drawGraphFor("raw", "ay", color(0, 255, 0));
  drawGraphFor("raw", "az", color(0, 0, 255));
  pop();
}
function drawGraphFor(theSource, theType, theColor) {
  push();
  stroke(theColor);
  strokeWeight(1.5);
  noFill();
  witmotions.forEach((v, k) => {
    beginShape();
    let v0 = 0;
    v.history[theSource][theType].forEach((el, i) => {
      vertex(i * 3, el * 20);
    });
    endShape();
    translate(200, 0);
  });
  pop();
}

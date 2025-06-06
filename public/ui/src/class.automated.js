class Automated {
  constructor(theScore) {
    this.state = "stop";
    this.score = theScore;
    this.speed = 1;
    this.t = 0;
    this.x = 20;
    this.y = 350;
    this.w = 800;
    this.h = 70;
    this.pos = 0;
  }

  start() {
    this.t = 0;
    this.state = "play";
  }
  rewind() {
    this.t = 0;
  }
  pause() {
    this.state = "pause";
    console.log("pause", this.t);
  }

  play() {
    this.state = "play";
  }

  setSpeed(theType, theValue) {
    if (theType === "slower") this.speed -= theValue;
    else if (theType === "normal") this.speed = 1;
    else if (theType === "faster") this.speed += theValue;
  }

  draw(theCxt) {
    theCxt.push();
    theCxt.translate(-theCxt.width / 2, -theCxt.height / 2);
    theCxt.translate(this.x, this.y);
    theCxt.fill(255);
    theCxt.text(`current playback speed ${this.speed}`,0,0);
    theCxt.translate(0,20);
    theCxt.stroke(255, 0, 0);
    theCxt.image(this.score, 0, 0, this.w, this.h);
    theCxt.noFill();
    theCxt.rect(0, 0, this.w, this.h);
    theCxt.noStroke();
    theCxt.fill(255, 0, 0);
    theCxt.noStroke();
    theCxt.rect(int(this.pos), this.h, 3, 10);
    theCxt.rect(int(this.pos), -10, 3, 10);
    theCxt.pop();
  }

  compute(theOutput) {
    if (this.state === "play") {
      this.t += this.speed;
    }

    if (this.t >= this.score.width) {
      this.t = 0;
    }
    let output = Array(theOutput.size).fill(0);
    const maxValue = 254;

    for (let i = 0; i < 7; i++) {
      const x = this.t + 1;
      const y = i * 10 + 5;
      output[i] = min(this.score.get(x, y)[0], maxValue);
    }

    this.pos = map(this.t, 0, this.score.width, 0, this.w);
    return output;
  }

  mousePressed() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
      const mx = mouseX - this.x;
      this.t = map(mx, 0, this.w, 0, this.score.width);
    }
  }
  mouseDragged() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
      const mx = mouseX - this.x;
      this.t = map(mx, 0, this.w, 0, this.score.width);
    }
  }
}

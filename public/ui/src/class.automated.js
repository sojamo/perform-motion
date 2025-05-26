class Automated {
  constructor(theScore) {
    this.state = "off";
    this.score = theScore;
    this.pos = 0;
    this.start();
  }

  start() {
    this.t0 = millis();
    this.t1 = millis();
    this.timeline = {
      "intro": 20,
      "phase-1": 10,
      "phase-2": 20,
      "phase-3": 10,
      "phase-4": 30,
      "end": 10,
    };
    this.currentIndex = 0;
    this.current = Object.keys(this.timeline)[this.currentIndex];
  }

  draw(theCxt) {
    theCxt.push();
    theCxt.translate(-theCxt.width / 2, -theCxt.height / 2);
    theCxt.translate(20, 400);
    theCxt.image(this.score, 0, 0, 900,70);
    theCxt.fill(255,0,0);
    theCxt.noStroke();
    theCxt.rect(int(this.pos / 10),70,3,10);
    theCxt.rect(int(this.pos / 10),-10,3,10);
    theCxt.pop();
  }

  compute(theOutput) {
    let output = Array(theOutput.size).fill(0);
    const maxValue = 254;
    
    const timestretch = 4; // x-times slower than realtime
    const fps = 30 * timestretch;
    const mins = 5;
    const tLen = 1000 * fps * mins;
    const t = millis() - this.t0;

    this.pos = map(t, 0, tLen, 0, this.score.width);
    
    for(let i=0;i<7;i++) {
      const x = this.pos + 1;
      const y = i * 10 + 5;
      output[i] = min(this.score.get(x, y)[0], maxValue);
    }
    return output;
  }

  _programmatic(theOutput) {
    let output = Array(theOutput.size).fill(0);
    if (this.currentIndex >= Object.keys(this.timeline).length) return output;

    const delta = millis() - this.t1;
    const len = this.timeline[this.current] * 100;
    if (delta > len) {
      this.t1 = millis();
      this.currentIndex++;
      this.current = Object.keys(this.timeline)[this.currentIndex];
    }
    // console.log(`${millis() - this.t0}\t${this.current}\t${delta}\t${this.timeline[this.current]}`);
    const maxValue = 254;
    switch (this.current) {
      case ("intro"):
        output[1] = maxValue;
        break;
      case ("phase-1"):
        const t = millis() / 1000;
        const v0 = map(sin(t * 10.1), -1, 1, 0, maxValue);
        output = Array(theOutput.size).fill(v0);
        break;
      case ("phase-2"):
        output = Array(theOutput.size).fill(maxValue);
        break;
      case ("phase-3"):
        break;
      case ("phase-4"):
        break;
      case ("end"):
        break;
    }
    return output;
  }

}

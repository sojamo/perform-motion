class Render {
  constructor(theApp) {
  }

  draw(theCxt, theWitmotions) {
    theCxt.background(0);
    theCxt.lights();
    theCxt.noStroke();
    theCxt.push();
    theCxt.ortho();
    theCxt.translate(300, -theCxt.height / 2 + 100);
    theWitmotions.forEach((v, k) => {
      const data = v.getData();
      const v0 = v.interact(
        theCxt.radians(data.roll),
        theCxt.radians(data.pitch),
        theCxt.radians(data.yaw),
      );

      theCxt.push();
      theCxt.rotateX(v0.roll);
      theCxt.rotateZ(v0.pitch);
      theCxt.rotateY(v0.yaw);

      theCxt.box(100, 20, 100);
      theCxt.pop();
      theCxt.translate(0, 300);
    });
    theCxt.pop();
    theCxt.push();
    theCxt.translate(-theCxt.width / 2, -theCxt.height / 2);
    theCxt.translate(width / 2, 100);

    this._drawGraphFor(theCxt, theWitmotions, "raw", "ax", color(255, 0, 0));
    this._drawGraphFor(theCxt, theWitmotions, "raw", "ay", color(0, 255, 0));
    this._drawGraphFor(theCxt, theWitmotions, "raw", "az", color(0, 0, 255));

    theCxt.translate(30, 100);

    this._drawRadialGraphFor(
      theCxt,
      theWitmotions,
      "filtered",
      "roll",
      color(255, 0, 0),
    );
    theCxt.translate(70, 0);
    this._drawRadialGraphFor(
      theCxt,
      theWitmotions,
      "filtered",
      "pitch",
      color(0, 255, 0),
    );
    theCxt.translate(70, 0);
    this._drawRadialGraphFor(
      theCxt,
      theWitmotions,
      "filtered",
      "yaw",
      color(0, 0, 255),
    );

    theCxt.pop();
  }

  lights(theCxt, theOutput) {
    const out = theOutput.slice(0, -1);
    push();
    translate(-width/2, -height/2);
    translate(20,100);
    out.forEach((light,idx) => {
      stroke(100);
      fill(int(light));
      rect(idx * 30, 0, 15, 200);
    });
    pop();
  }

  _drawGraphFor(theCxt, theWitmotions, theSource, theType, theColor) {
    theCxt.push();
    theCxt.noFill();
    theCxt.stroke(theColor);
    theCxt.strokeWeight(1.5);
    let n = 0;
    theWitmotions.forEach((v, k) => {
      const label = v.history[theSource][theType].slice(-1);
      theCxt.beginShape();
      v.history[theSource][theType].forEach((el, i) => {
        theCxt.vertex(i * 2, el * 20);
      });
      theCxt.endShape();
      theCxt.translate(0, 300);
    });
    pop();
  }
  _drawRadialGraphFor(theCxt, theWitmotions, theSource, theType, theColor) {
    const diameter = 50;
    theCxt.push();
    theCxt.noFill();
    theCxt.stroke(theColor);
    theCxt.strokeWeight(1.5);
    theWitmotions.forEach((v, k) => {
      let v0 = v.history[theSource][theType].slice(-1);
      theCxt.ellipse(0, 0, diameter);
      theCxt.push();
      theCxt.rotate(v0);
      theCxt.rect(0, 0, diameter / 2, 4);
      theCxt.pop();
      theCxt.fill(255);
      theCxt.text(theCxt.nf(v0 % theCxt.TWO_PI, 1, 2), 0, diameter);
      theCxt.noFill();
      theCxt.translate(0, 300);
    });
    pop();
  }

  drawReport(theCxt, theReport) {
    const txt = theReport.map((v, k) => {
      const desc = v.desc;
      let val = "";
      if (typeof v.value === "object" && v.value !== null) {
        if (Array.isArray(v.value)) {
          val = v.value.length;
        } else {
          val = JSON.stringify(v.value);
        }
      } else if (typeof v.value === "number") {
        if (Number.isInteger(v.value)) {
          val = v.value;
        } else {
          val = v.value.toFixed(2);
        }
      } else {
        val = v.value;
      }
      return `${desc}: ${val}`;
    }).join("\n");
    theCxt.push();
    theCxt.textSize(20);
    theCxt.translate(-width / 2, -height / 2);
    theCxt.translate(100, 100);
    theCxt.fill(255);
    theCxt.text(txt, 0, 0, width / 2 - 200, height - 200);
    theCxt.pop();
  }
}

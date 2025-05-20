class Render {
  constructor(theApp) {
  }

  draw(theApp, theWitmotions) {
    theApp.background(0);
    theApp.lights();
    theApp.noStroke();
    theApp.push();
    theApp.ortho();
    theApp.translate(300, -theApp.height / 2 + 100);
    theWitmotions.forEach((v, k) => {
      const data = v.getData();
      const v0 = v.interact(
        theApp.radians(data.roll),
        theApp.radians(data.pitch),
        theApp.radians(data.yaw),
      );

      theApp.push();
      theApp.rotateX(v0.roll);
      theApp.rotateZ(v0.pitch);
      theApp.rotateY(v0.yaw);

      theApp.box(100, 20, 100);
      theApp.pop();
      theApp.translate(0, 300);
    });
    theApp.pop();
    theApp.push();
    theApp.translate(-theApp.width / 2, -theApp.height / 2);
    theApp.translate(width / 2, 100);

    this._drawGraphFor(theApp, theWitmotions, "raw", "ax", color(255, 0, 0));
    this._drawGraphFor(theApp, theWitmotions, "raw", "ay", color(0, 255, 0));
    this._drawGraphFor(theApp, theWitmotions, "raw", "az", color(0, 0, 255));

    theApp.translate(30, 100);

    this._drawRadialGraphFor(
      theApp,
      theWitmotions,
      "filtered",
      "roll",
      color(255, 0, 0),
    );
    theApp.translate(70, 0);
    this._drawRadialGraphFor(
      theApp,
      theWitmotions,
      "filtered",
      "pitch",
      color(0, 255, 0),
    );
    theApp.translate(70, 0);
    this._drawRadialGraphFor(
      theApp,
      theWitmotions,
      "filtered",
      "yaw",
      color(0, 0, 255),
    );

    theApp.pop();
  }

  _drawGraphFor(theApp, theWitmotions, theSource, theType, theColor) {
    theApp.push();
    theApp.noFill();
    theApp.stroke(theColor);
    theApp.strokeWeight(1.5);
    let n = 0;
    theWitmotions.forEach((v, k) => {
      const label = v.history[theSource][theType].slice(-1);
      theApp.beginShape();
      v.history[theSource][theType].forEach((el, i) => {
        theApp.vertex(i * 2, el * 20);
      });
      theApp.endShape();
      theApp.translate(0, 300);
    });
    pop();
  }
  _drawRadialGraphFor(theApp, theWitmotions, theSource, theType, theColor) {
    const diameter = 50;
    theApp.push();
    theApp.noFill();
    theApp.stroke(theColor);
    theApp.strokeWeight(1.5);
    theWitmotions.forEach((v, k) => {
      let v0 = v.history[theSource][theType].slice(-1);
      theApp.ellipse(0, 0, diameter);
      theApp.push();
      theApp.rotate(v0);
      theApp.rect(0, 0, diameter / 2, 4);
      theApp.pop();
      theApp.fill(255);
      theApp.text(theApp.nf(v0 % theApp.TWO_PI, 1, 2), 0, diameter);
      theApp.noFill();
      theApp.translate(0, 300);
    });
    pop();
  }

  drawReport(theApp, theReport) {
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
    theApp.push();
    theApp.textSize(20);
    theApp.translate(-width / 2, -height / 2);
    theApp.translate(100, 100);
    theApp.fill(255);
    theApp.text(txt, 0, 0, width / 2 - 200, height - 200);
    theApp.pop();
  }
}

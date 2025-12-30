class Render {
  constructor(theApp) {
    this.params = {
      off: { x: 50, y: 50 },
      spacing: { x: 0, y: 250 },
      box: { x: 300, y: 60, w: 50, h: 10, l: 50 },
      graph: { x: 0, y: 0, h: 20 },
      radial: { x: 20, y: 70, d: 40 },
    };
  }

  draw(theCxt, theWitmotions) {
    // Set up the canvas background and lighting
    theCxt.background(0);
    theCxt.lights();

    theCxt.push(); // start:main
    theCxt.noStroke();
    theCxt.translate(this.params.off.x, this.params.off.y);

    // Section 1: Render 3D boxes representing sensor orientation
    theCxt.push();
    theCxt.ortho(); // Use orthographic projection for consistent box rendering
    theCxt.translate(-theCxt.width / 2, -theCxt.height / 2);
    // Position the first box
    theCxt.translate(this.params.box.x, this.params.box.y);

    theWitmotions.forEach((v, k) => {
      // Get raw sensor data and apply Kalman filtering
      const data = v.getData();
      const v0 = v.interact(
        theCxt.radians(data.roll),
        theCxt.radians(data.pitch),
        theCxt.radians(data.yaw),
      );

      theCxt.push();
      theCxt.fill(255, 255, 255);
      theCxt.text("UUID:" + v.uuid, 0, -this.params.box.y);
      theCxt.pop();

      // Apply filtered rotation values to the 3D box
      theCxt.push();
      theCxt.rotateX(v0.roll); // Apply roll rotation
      theCxt.rotateZ(v0.pitch); // Apply pitch rotation
      theCxt.rotateY(v0.yaw); // Apply yaw rotation

      // Draw the sensor as a flat box
      theCxt.box(this.params.box.w, this.params.box.h, this.params.box.l);
      theCxt.pop();
      // Move down for the next sensor (if multiple)
      theCxt.translate(0, this.params.spacing.y);
    });
    theCxt.pop();

    // Section 2: Render linear acceleration graphs
    theCxt.push();
    // Reset to top-left corner
    theCxt.translate(-theCxt.width / 2, -theCxt.height / 2);

    // Draw raw acceleration data as line graphs (x, y, z axes in RGB)
    this._drawGraphFor(theCxt, theWitmotions, "raw", "ax", color(255, 0, 0));
    this._drawGraphFor(theCxt, theWitmotions, "raw", "ay", color(0, 255, 0));
    this._drawGraphFor(theCxt, theWitmotions, "raw", "az", color(0, 0, 255));

    // Section 3: Render radial angle indicators
    // // Move down and position for radial graphs
    theCxt.translate(this.params.radial.x, this.params.radial.y);

    // Draw filtered orientation angles as radial dials
    this._drawRadialGraphFor(
      theCxt,
      theWitmotions,
      "filtered",
      "roll",
      color(255, 0, 0), // Roll in red
    );
    theCxt.translate(70, 0); // Move right for next dial
    this._drawRadialGraphFor(
      theCxt,
      theWitmotions,
      "filtered",
      "pitch",
      color(0, 255, 0), // Pitch in green
    );
    theCxt.translate(70, 0); // Move right for next dial
    this._drawRadialGraphFor(
      theCxt,
      theWitmotions,
      "filtered",
      "yaw",
      color(0, 0, 255), // Yaw in blue
    );

    theCxt.pop();
    theCxt.pop(); // end:main
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
        const x = this.params.graph.x + i * 2;
        const y = this.params.graph.y + el * this.params.graph.h;
        theCxt.vertex(x, y);
      });
      theCxt.endShape();
      theCxt.translate(0, this.params.spacing.y);
    });
    pop();
  }
  _drawRadialGraphFor(theCxt, theWitmotions, theSource, theType, theColor) {
    const diameter = this.params.radial.d;
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
      theCxt.translate(0, this.params.spacing.y);
    });
    pop();
  }

  drawReport(theCxt, theReport) {
    const txt = theReport
      .map((v, k) => {
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
      })
      .join("\n");
    theCxt.push();
    theCxt.textSize(20);
    theCxt.translate(-width / 2, -height / 2);
    theCxt.translate(100, 100);
    theCxt.fill(255);
    theCxt.text(txt, 0, 0, width / 2 - 200, height - 200);
    theCxt.pop();
  }
}

class UIbridge {
  constructor() {
    this.actionTriggered = false;
    this.status = {};
    window.triggerP5Action = this.receive.bind(this);
    this.showDataTable = false;
  }

  receive(theArgs) {
    const { ref, value } = theArgs;

    if (ref === "pause") {
      this.actionTriggered = !this.actionTriggered;
    } else if (ref === "mode") {
      control.mode = value; // 0 = UI, 1 = Sensor, 2 = Auto
      if (control.mode === 2) {
        auto.play();
      }
    } else if (ref === "lights") {
      switch (value) {
        case 0:
          control.preset.current = control.preset.off;
          break;
        case 1:
          control.preset.current = control.preset.on;
          break;
      }
    } else if (ref === "individual-light") {
      control.preset.current = control.preset.current.map((el, i) => {
        return (i + 1) === value ? 254 : 0;
      });
    } else if (ref === "automated-controls") {
      if (value === 0) auto.play();
      else if (value === 1) auto.pause();
      else if (value === 2) auto.rewind();
    } else if (ref === "automated-speed") {
      if (value === 0) auto.setSpeed("slower", 0.25);
      else if (value === 1) auto.setSpeed("normal");
      else if (value === 2) auto.setSpeed("faster", 0.5);
    }
  }

  send(theElementId, theMessage) {
    const fn = () => this._createTableFromData(theMessage, "data-report");
    this._compareJSON(theMessage, this.status, "", fn);
    this.status = theMessage;
  }

  _compareJSON(obj1, obj2, path = "", onNumberChanged = () => {}) {
    for (const key in obj1) {
      const val1 = obj1[key];
      const val2 = obj2[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (
        typeof val1 === "object" && val1 !== null && typeof val2 === "object" &&
        val2 !== null
      ) {
        // Both are objects, recurse
        this._compareJSON(val1, val2, currentPath, onNumberChanged);
      } else if (typeof val1 === "number" && typeof val2 === "number") {
        if (val1 !== val2) {
          // Only trigger update if the number value changed
          onNumberChanged(obj1);
          console.log("different");
        }
      }
      // (else: ignore non-numeric or mismatched types)
    }
  }

  _createTableFromData(data, divId = "report-table") {
    if(this.showDataTable === false) return;
    
    const table = document.createElement("table");
    table.border = 1;

    // Header row
    const header = table.insertRow();
    header.insertCell().textContent = "Key";
    header.insertCell().textContent = "Value";

    // Data rows
    data.forEach((item) => {
      const row = table.insertRow();
      row.insertCell().textContent = item.desc;
      // If value is an array or object, convert to JSON string
      row.insertCell().textContent = (typeof item.value === "object")
        ? JSON.stringify(item.value)
        : item.value;
    });

    // Replace the contents of the div with the table
    const container = document.getElementById(divId);
    container.innerHTML = ""; // Clear any previous content
    container.appendChild(table);
  }
}

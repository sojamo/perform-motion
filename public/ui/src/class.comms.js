class SocketCommunication {
  constructor(theApp) {
    this.app = theApp;
    const _self = this;

    // Connect to the WebSocket server (adjust URL/port if needed)
    this.socket = new WebSocket("ws://localhost:4000");

    this.socket.onopen = function (event) {
      console.log("Connected to the WebSocket server.");
      const jsonFormattedMsg = { source: "ping", data: "ping" };
      _self.socket.send(JSON.stringify(jsonFormattedMsg));
    };

    this.socket.onmessage = function (event) {
      const { source, data } = JSON.parse(event.data);

      if (source === "bt") {
        const uuid = data.uuid;
        const input = data.data;
        _self.app.on("data", { uuid: uuid, data: input });
      } else if (source === "serial") {
        console.log(data);
      } else {
        console.log("received unknown source", source, data);
      }
      return;
    };

    this.socket.onerror = function (event) {
      console.error("WebSocket error:", event);
    };

    this.socket.onclose = function (event) {
      console.log("WebSocket connection closed.");
    };
  }

  readyState() {
    if(!this.socket) return -1;
    return this.socket.readyState;
  }

  send(thePayload) {
    this.socket.send(JSON.stringify(thePayload));
  }
}

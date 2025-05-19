import { WebSocketServer } from "ws";
import { EventEmitter } from "events";

export default class WSService extends EventEmitter {
  constructor(port) {
    super();
    this.port = port;
    this.wss = null;
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port });
    this.wss.on("connection", (ws, req) => {
      const remote = req.socket.remoteAddress;
      console.log(`Client connected: ${remote}`);

      ws.on("message", (msg) => {
        this.interpret(msg);
      });

      ws.on("close", () => {
        console.log(`Client disconnected: ${remote}`);
      });

      ws.on("error", (err) => {
        console.error(`WebSocket error for ${remote}:`, err);
      });
    });

    this.wss.on("listening", () => {
      console.log(`WebSocket server listening on ws://0.0.0.0:${this.port}`);
    });

    this.wss.on("error", (err) => {
      console.error("WebSocket server error:", err);
    });
  }

  /**
   * Interpret an incoming WebSocket message.
   * Parses the JSON message and emits a 'data' event
   * with the parsed payload.
   *
   * The orchestrator is listening for this event.
   *
   * @param {string} theMsg - The incoming message as a JSON string.
   */
  interpret(theMsg) {
    try {
      // Attempt to parse the incoming message as JSON
      const payload = JSON.parse(theMsg);

      // Emit the parsed payload as a 'data' event
      this.emit("data", payload);
    } catch (error) {
      // Log an error if parsing fails
      console.error(
        `Error parsing WebSocket message ${theMsg}:`,
        error.message,
      );
    }
  }

  /**
   * Broadcast a payload to all connected WebSocket clients,
   * triggered by the Orchestrator listening for BLEService data events.
   *
   * Receivers will most probably be web-based interface such as
   * dashboards or other frontends and visualizations.
   *
   * @param {Object} thePayload - The payload to send.
   */
  broadcast(thePayload) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Send the serialized payload to the client.
        client.send(JSON.stringify(thePayload));
      }
    });
  }
}

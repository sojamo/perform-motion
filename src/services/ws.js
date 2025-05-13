import { WebSocketServer } from "ws";

export default class WSService {
  constructor(port) {
    this.port = port;
    this.wss = null;
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port });
    this.wss.on("connection", (ws, req) => {
      const remote = req.socket.remoteAddress;
      console.log(`Client connected: ${remote}`);

      ws.on("message", (msg) => {
        console.log(`← Received from ${remote}: ${msg}`);
        // echo back, or handle custom protocol here:
        // ws.send(JSON.stringify({ success: true, echo: msg }));
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

  broadcast(thePayload) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(thePayload));
      }
    });
  }
}

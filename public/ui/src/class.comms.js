/**
 * SocketCommunication
 *
 * This class manages a WebSocket connection between
 * a client application (such as a browser) and a
 * WebSocket server. It abstracts all connection logic,
 * automatically connects on instantiation, and handles
 * events for connection open, message receipt, errors,
 * and closure.
 *
 * Incoming messages are parsed and routed according to
 * their source (e.g., Bluetooth or serial). Relevant data
 * is forwarded to the main application via callbacks.
 *
 * The class also provides utility methods for sending
 * JSON-formatted messages to the server and for checking
 * the current connection status.
 * 
 * Public API:
 *
 *   constructor(theApp)
 *     - Instantiates and immediately connects to the WebSocket server.
 *     - `theApp`: An application object that should have an `.on('data', payload)` method.
 *
 *   readyState()
 *     - Returns the current WebSocket readyState (integer constant).
 *     - Usage: `const state = socketComm.readyState();`
 *
 *   send(thePayload)
 *     - Sends a JSON-encoded payload to the server.
 *     - `thePayload`: Any object to be sent as JSON.
 *     - Usage: `socketComm.send({ foo: 42 });`
 */

class SocketCommunication {
  constructor(theApp) {
    const _self = this; // Keep a reference to 'this' for inner functions
    _self.app = theApp; // Store reference to the parent application

    // 1. Connect to the WebSocket
    // server at ws://localhost:4000
    this.socket = new WebSocket("ws://localhost:4000");

    // 2. Handle successful
    // connection to the server
    this.socket.onopen = function (event) {
      console.log("Connected to the WebSocket server.");
      // Send an initial 'ping' message as a JSON object
      const jsonFormattedMsg = { source: "ping", data: "ping" };
      _self.socket.send(JSON.stringify(jsonFormattedMsg));
    };

    // 3. Handle incoming messages from
    // the WebSocket server
    this.socket.onmessage = function (event) {
      // Parse the incoming data as JSON
      const { source, data } = JSON.parse(event.data);

      if (source === "bt") {
        // If the source is 'bt' (Bluetooth),
        // notify the app with the uuid and data
        const uuid = data.uuid;
        const input = data.data;
        _self.app.on("data", { uuid: uuid, data: input });
      } else if (source === "serial") {
        // If the source is 'serial',
        // simply log the data
        console.log(data);
      } else {
        // For any other source,
        // log as unknown
        console.log("received unknown source", source, data);
      }
      return;
    };

    // 4. Handle any errors that occur
    // with the WebSocket connection
    this.socket.onerror = function (event) {
      console.error("WebSocket error:", event);
    };

    // 5. Handle closure of the WebSocket connection
    this.socket.onclose = function (event) {
      console.log("WebSocket connection closed.");
    };
  }

  // Returns the current readyState of
  // the WebSocket (e.g., OPEN, CLOSED)
  readyState() {
    if (!this.socket) return -1;
    return this.socket.readyState;
  }

  // Send a JSON payload over the WebSocket
  send(thePayload) {
    if (this.readyState() !== WebSocket.OPEN) return;
    // console.log(`send: ${JSON.stringify(thePayload)}`);
    this.socket.send(JSON.stringify(thePayload));
  }
}

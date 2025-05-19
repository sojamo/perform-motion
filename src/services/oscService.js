import {Client, Server} from 'node-osc';

export default class OSCService {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.serverPort = 10000;
    this.client = new Client(this.host, this.port);
    this.server = new Server(this.serverPort, '0.0.0.0', () => {
      console.log(`OSC listening on port ${this.serverPort}`);
      console.log(`OSC sending to ${this.host}:${this.port}`);
    });
    
    this.server.on('message', (msg, rinfo) => {
      console.log(msg, rinfo);
    });

    setInterval(()=> {
      this.client.send('/ping', 1,1.2,"hello");
    }, 1000);
    
  }

  send(theAddress, thePayload) {
    this.client.send(theAddress, thePayload);
  }
}
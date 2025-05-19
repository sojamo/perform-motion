import express from "express";
import path from "path";

export default class WebService {
  constructor(thePort, theDirectory) {
    this.port = thePort;
    this.directory = theDirectory;
  }

  start() {
    const app = express();
    const dir = path.resolve(this.directory);
    const port = this.port; 
    app.use(express.static(dir));
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`
      Static server running at http://0.0.0.0:${port}
      serving from folder ${this.directory} 
      open from LAN at http://<your-lan-ip>:${port}
      `);
    });
  }
}

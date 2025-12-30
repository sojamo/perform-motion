# Perform Motion

A project that looks at motion sensors (wit motion) in a collaborative performance setting. 

## Table of Contents
1. [Background](#background)  
2. [Features](#features)
3. [Technical Details](#technical-details)
4. [Prerequisites](#prerequisites)
5. [How to run](#how-to-run)
6. [Troubleshooting](#troubleshooting)
7. [Reset branch](#reset-branch)
8. [Acknowledgements](#acknowledgements)  
9. [Author](#author)

## Background
This is a modified version from branch 'perform-auto-play' to receive data from a number of wit motion sensors for the 'Unnatural' performance. The code is not well cleaned up but works for the requirements of the intended performance.

## Features
- This version runs from the command line and sends raw data via OSC. Raw data here refers to 9 data points: xyz-rotation, xyz-acceleration, and xyz-gravity.
- The following address pattern is used: `/pm/raw/<id-assign-from-uuid>`, with a typetag `fffffffff`. The id is assigned from the uuid of the sensor, see `config.js`. Note that uuid's are different for each sensor and the device they are connected to. The same sensor used with different laptops for example will have different uuid's.
- Sensor uuid's must be added manually to the `config.js` file.
- A debug interface is available in the browser at `http://0.0.0.0:3000/ui`

### Suggestions for improvements
- implement filtering as applied in the web ui directly on the server and then send the filtered data via OSC.

## Technical Details
- The application is built using Node.js and Express.js.
- The OSC communication is handled using the `node-osc` library.
- The debug interface is built using p5js and websockets.
- The WT901BLE67 Wit Motion sensor is used for motion tracking over Bluetooth.
- OSC is sent to localhost at port 12000

### OSC Message Format
- **Address**: `/pm/raw/<sensor-id>`
- **Type tags**: `fffffffff` (9 float values)
- **Data order**:
  - [0-2]: Acceleration (ax, ay, az) in g
  - [3-5]: Gyroscope (gx, gy, gz) in deg/s
  - [6-8]: Orientation (roll, pitch, yaw).  

**Example:**
- Address: `/pm/raw/1`
- Values: `[0.12, -0.03, 0.98, 1.2, -0.5, 0.8, -3.43, 0.36, -0.01]`


### Finding Sensor UUIDs
1. put the sensor into discovery mode (press button on sensor and wait for LED to blink green)
2. open terminal, navigate to folder `perform-motion`
3. run `npm start`
4. after you see `Starting BLE scan...` printed in the terminal, wait for the sensor to be discovered and its uuid to be printed in the terminal and you should see a message like `We are connecting to sensor WT901BLE67 with uuid (7ce331532d7087440b2754705259b0be)`
5. copy the 32-character hexadecimal string UUID and add it to the `config.js` file

## Prerequisites
- Node.js 23.x or higher
- macOS, Linux, or Windows with Bluetooth support
- WT901BLE67 WitMotion sensor(s)
- OSC-compatible software to receive data (e.g., Max/MSP, TouchDesigner, Processing)

## How to run
1. Clone the repository: `git clone https://github.com/sojamo/perform-motion.git`
2. Navigate to the project directory: `cd perform-motion`
3. Install dependencies: `npm install`
4. Configure sensors in `config.js` (see [Finding Sensor UUIDs](#finding-sensor-uuids))
5. Start the application: `npm start`
   - Expected output: Configuration settings and `Starting BLE scan...`
6. Open your browser and navigate to `http://0.0.0.0:3000/ui` to view the debug interface
7. Configure your OSC receiver to listen on port 12000

## Troubleshooting

### Sensor Not Discovered
- Ensure sensor is in discovery mode (green blinking LED)
- Check that Bluetooth is enabled on your computer
- Note: UUID changes when paired with different devices

### No OSC Data Received
- Verify OSC receiver is listening on port 12000
- Check firewall settings allow localhost communication
- Confirm sensor is connected via the debug interface

### Debug Interface Not Loading
- Ensure the server is running (`npm start`)
- Try `http://localhost:3000/ui` in your browser
- Check console for error messages


## Reset Branch
To reset a branch locally to match the latest repo version of the branch, use the following commands

```bash
git checkout your-branch-name # optional
git fetch origin # Fetch the latest updates from the remote
git reset --hard origin/your-branch-name # Reset your local branch to the remote version
git clean -fd # Optional: Clean up untracked files (if needed)
```

## Acknowledgements
- Created for the 'Unnatural' performance project
- Uses [node-osc](https://github.com/MylesBorins/node-osc) for OSC communication
- WitMotion WT901BLE67 sensor integration
- Built with p5.js for debug interface

## Author
[sojamo](https://github.com/sojamo), Andreas Schlegel

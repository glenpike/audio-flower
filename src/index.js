const osc = require('osc');
const fs = require('fs');
const path = require('path');

// Serial Port - from Arduino
const serialDebug = true;
const portName = '/dev/ttyACM0'
const SerialPort = require('serialport');
const port = new SerialPort(portName, {
    baudRate: 9600,
  },
  function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
});

// Need to smooth data over time, as we are triggering a lot.
// two triggerThresholds - trigger & reset?
const triggerThreshold = 800;
const resetThreshold = 100;
let triggered = false;
const handleData = ({ time, value }) => {
  const sensorValue = Number.parseInt(value);
  if (Number.isNaN(sensorValue)) {
    console.log('handleData - invalid sensor value: ', value);
    return;
  }
  if (serialDebug) {
    console.log(`sensorValue: ${sensorValue} (${value})`);
  }
  /*if (sensorValue > triggerThreshold && !triggered) {
    console.log('triggering...');
    // triggerAudio();
    triggered = true;
  } else if(sensorValue < resetThreshold && triggered) {
    console.log('resetting trigger...');
    triggered = false;
  }*/
};

let buffer = '';
port.on('readable', function () {
  buffer += port.read().toString();
  const messages = buffer.split('\n');
  if (messages.length > 1) {
    // save the bit for the buffer.
    buffer = messages.pop();
    messages.forEach((m) => {
      const regex = /([0-9]+)\t([0-9]+)\t([0-9]+)\t([0-9]+)/;
      const match = m.match(regex);
      // console.log('match ', match);
      if (match) {
        const [, time, value] = match;
        handleData({ time, value});
      }
    });
  }
});


const udpPort = new osc.UDPPort({
    // This is the port we're listening on.
    localAddress: '127.0.0.1',
    localPort: 57121,

    // This is where sonic-pi is listening for OSC messages.
    remoteAddress: '127.0.0.1',
    remotePort: 4559,
    metadata: true
});

// Open the socket.
udpPort.open();

const sendSample = (sampleFile) => {
    const fullPath = path.resolve(sampleDir, sampleFile);
    const msg = {
        address: '/trigger/sample',
        args: [
            {
                type: 's',
                value: fullPath,
            },
        ],
    };

    console.log('/trigger/sample', msg.args);
    udpPort.send(msg);
};

const sendAmbient = (choice) => {
    const msg = {
        address: '/trigger/ambient',
        args: [
            {
                type: 'i',
                value: choice,
            },
        ],
    };

    console.log('/trigger/ambient', msg.args);
    udpPort.send(msg);
};

const sendSynth = (name) => {
    const msg = {
        address: '/trigger/synth',
        args: [{
            type: 's',
            value: name,
        }],
    };

    console.log(msg.address, name);
    udpPort.send(msg);
};

const sendDrums= (choice) => {
    const msg = {
        address: '/trigger/drums',
        args: [
            {
                type: 'i',
                value: choice,
            },
        ],
    };

    console.log('/trigger/drums');
    udpPort.send(msg);
};


// Doesn't work
// https://github.com/samaaron/sonic-pi/wiki/Sonic-Pi-Internals----GUI-Ruby-API#run-code-agent-name-code
const sendCode = (code) => {
    const msg = {
        address: '/run-code',
        args: [
            {
                type: 's',
                value: '1234-abc',
            },
            {
                type: 's',
                value: code,
            },

        ],
    };

    console.log(`/run-code '${code}'`);
    udpPort.send(msg);
}

const gpio = require('rpi-gpio');

gpio.setMode(gpio.MODE_BCM);
const IN_1 = 4;
const IN_2 = 5;
const IN_3 = 6;
const IN_4 = 3;
const IN_5 = 2;
const IN_6 = 23;
const IN_7 = 24;


const readInput = async (input) => {
    return new Promise((resolve, reject) => {
        gpio.read(input, (err, value) => {
            if (err) {
                reject(err);
            }
            resolve(value);
        });
    });
}

const setupPin = async (pin) => {
    return new Promise((resolve, reject) => {
        gpio.setup(pin, gpio.DIR_IN, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

const AMBIENT_SAMPLES = 10;
const run = () => {
    console.log('running');
    let lastIn2 = true;
    let lastIn3 = true;
    let lastIn5 = true;
    let lastIn6 = true;
    let lastIn7 = true;
    
    sendCode("loop do ; in_thread do ; puts 'hello' ; sleep 3 ; end ; sleep 0.025 ; end");
    setInterval(async () => {
        let value = await readInput(IN_1);
        if(!value) {
            const choice = Math.floor(Math.random() * sampleFiles.length);
            sendSample(sampleFiles[choice]);
        }
        value = await readInput(IN_2);
        if(!value && lastIn2 !== value) {
            sendSynth('squelch');
        }
        lastIn2 = value;
        value = await readInput(IN_3);
        if(!value && lastIn3 !== value) {
            sendSynth('dark_ambient');
        }
        lastIn3 = value;
        value = await readInput(IN_4);
        if(!value) {
            const choice = Math.ceil(Math.random() * AMBIENT_SAMPLES);
            sendAmbient(choice);
        }
        value = await readInput(IN_5);
        if(!value && lastIn5 !== value) {
            sendSynth('space_scanner');
        }
        lastIn5 = value;
        value = await readInput(IN_6);
        if(!value && lastIn6 !== value) {
            sendSynth('trance');
        }
        lastIn7 = value;
        value = await readInput(IN_7);
        if(!value && lastIn7 !== value) {
            sendSynth('slo_bells');
        }
        lastIn7 = value;
        
    }, 100);

}
const sampleDir = '../samples/'
const sampleFiles = fs.readdirSync(sampleDir);
console.log('sampleDir, ', sampleFiles);
const main = async () => {
    try {
        await setupPin(IN_1);
        await setupPin(IN_2);
        await setupPin(IN_3);
        await setupPin(IN_4);
        await setupPin(IN_5);
        await setupPin(IN_6);
        await setupPin(IN_7);
        await run();
    } catch(err) {
        console.log(err);
        process.exit(-1);
    }
}

main();

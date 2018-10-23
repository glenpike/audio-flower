const osc = require('osc');
const fs = require('fs');
const path = require('path');


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

const sendSynth = (name) => {
    const msg = {
        address: `/trigger/synth/${name}`,
        args: [],
    };

    console.log(msg.address);
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

const run = () => {
    console.log('running');
    let lastIn2;
    let lastIn3;
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
            // const choice = Math.floor(Math.random() * 4);
            sendSynth('space_scanner');
        }
        lastIn3 = value;
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
        await run();
    } catch(err) {
        console.log(err);
        process.exit(-1);
    }
}

main();

const osc = require('osc');

const audioSamples = require('./audio-samples');

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
    // create array of last changes to measure avg time between inputs
    // current mode.
    // current key.
    // current 'timeslot'
    // current sample set

    setInterval(async () => {
        // Read inputs - check for 'changes'
        // Also check which input, e.g. 1 + 2 + 3 affects mode!

        // if changed, store time since last change.

        // Measure avg time between inputs & which input - turn into 'mode'
        // If mode is different
          // set current mode and tell system if needed.
          // current mode may affect sample slots?

        // Get time of day / since start, divide into timeslot
        // If timeslot has changed
            // set the current key / and or person (different timeslots)

        // check for 'synth finished' new osc message from sonic-pi
        // ditto for fx,
        // ditto for long samples
        // record time since last long sample.

        // if input changed
            // get next sample and play
            // if synth finished && mode allows synth
                // trigger synth
            // else if fx finished && mode allows fx
                // trigger fx.

        // if samples empty
            // create sample set from shuffled lib of current person, etc.

    }, 100);

}
const sampleDir = '../samples/'
// Need to read directory recursively and build up
// 'set' of samples so we can access 'HITZ' & 'QUOTES' separately.
const main = async () => {
    try {
        const sampleFiles = await audioSamples.loadSamples(sampleDir);
        // console.log('sampleDir, ', sampleFiles);
        // const domSamples = audioSamples.getSampleFilesForPerson('DOM');
        // console.log('domSamples, ', domSamples);
        // const hitzSamples = audioSamples.getHitzForPerson('DOM');
        // console.log('hitzSamples, ', hitzSamples);

        await setupPin(IN_1);
        await setupPin(IN_2);
        await setupPin(IN_3);
        // Start sonic-pi and wait for 'ready'?
        await run();
    } catch(err) {
        console.log(err);
        process.exit(-1);
    }
}

main();
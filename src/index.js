// const osc = require('osc');
const oscServer = require('./osc-adapter');

const audioSamples = require('./audio-samples');

const sendSample = (sampleFile, type = 'hitz') => {
    const msg = {
        address: `/trigger/sample/${type}`,
        args: [
            {
                type: 's',
                value: sampleFile,
            },
        ],
    };

    oscServer.sendOSCMessage(msg);
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
    oscServer.sendOSCMessage(msg);
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
    oscServer.sendOSCMessage(msg);
};

const sendSteveReich = () => {
    const msg = {
        address: '/trigger/steve-reich',
        args: [],
    };

    console.log(msg.address);
    oscServer.sendOSCMessage(msg);
};

const sendDrums = (choice) => {
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
    oscServer.sendOSCMessage(msg);
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
    oscServer.sendOSCMessage(msg);
}

const gpio = require('rpi-gpio');

gpio.setMode(gpio.MODE_BCM);
const IN_1 = 4;
const IN_2 = 24;
const IN_3 = 6;

const inputs = [IN_1, IN_2, IN_3];

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

const checkIfInputTriggered = (input) => {
    let lastInputVal = null;
    return async () => {
        let triggered = false;
        const currentInputVal = await readInput(input);
        if (lastInputVal !== currentInputVal && !currentInputVal) {
            triggered = true;
        }
        lastInputVal = currentInputVal;
        return triggered;
    }
}

// Abstract...
const AMBIENT_SAMPLES = 10;

const MAX_INPUT_TIMES = 10;
const LOOP_INTERVAL = 100;

// TODO - fix the times...
const TIME_TO_IDLE = 20 * 1000;
const IDLE_TIME_BEFORE_SAMPLE = 20 * 1000;
const TIME_BETWEEN_LONG_SAMPLES = 20 * 1000;
const TIME_BETWEEN_QUOTE_SAMPLES = 5 * 1000;
const TIME_BETWEEN_SYNTHS = 5 * 1000;
const TIME_BETWEEN_DRUMS = 5 * 1000;

const MODE_IDLE = 'idle';
const MODE_HITZ = 'hitz';
const MODE_QUOTES = 'quotes';
const MODE_MUSIC = 'music';
const MODE_FX = 'fx';

const run = (sampleFiles) => {
    console.log('running');

    let serverReady = false;
    let lastTime = new Date().getTime();
    const startTime = lastTime;
    let currTime;
    let idleSamplePlaying = false;
    let quoteSamplePlaying = false;
    let synthPlaying = false;
    let drumsPlaying = false;
    let ambientPlaying = false;
    let steveReichPlaying = false;

    // create array of last changes to measure avg time between inputs
    const overallInputActivity = [startTime];
    const inputActivity = [];
    // Create an array of inputs to check each loop
    const inputChecks = inputs.map((input, idx) => {
        inputActivity[idx] = [startTime];
        return checkIfInputTriggered(input)
    });

    let currentMode = MODE_IDLE;
    let lastMode = currentMode;
    let timeInMode = 0;

    // current key?
    const allHitzSamples = audioSamples.getSampleFilesForType('HITZ');
    const allQuoteSamples = audioSamples.getSampleFilesForType('QUOTES');

    const people = Object.keys(sampleFiles);
    let currentPerson = people.indexOf('DOM');
    console.log('current person ', people[currentPerson]);
    let personLongSamples = audioSamples.getLongSamplesForPerson(people[currentPerson]);
    let currentLongSamples = personLongSamples.slice(0);
    let currentQuoteSamples = allQuoteSamples.slice(0);

    const synths = ['space_scanner', 'squelch', 'trance',
            'dark_ambient', 'slo_bells', 'tri_me', 'strings'];
    let currentSynths = synths.slice(0);

    const setMode = (mode) => {
        console.log(`changing mode to ${mode}`);
        currentMode = mode;
        timeInMode = 0;
    };

    const playNextHitzSample = () => {
        const choice = Math.floor(Math.random() * allHitzSamples.length);
        const sample = allHitzSamples[choice]
        sendSample(sample);
    };

    const playNextLongSample = () => {
	// Don't play until server is ready, because idle kicks in
	// before sonic-pi starts and then breaks the idleSamplePlaying
	// 'blocker'
	if (!serverReady) return;
        const choice = Math.floor(Math.random() * currentLongSamples.length);
        const sample = currentLongSamples.splice(choice, 1);
        if (sample && sample[0]) {
            console.log('playing long sample ', sample[0]);
            sendSample(sample[0], 'long');
            idleSamplePlaying = true;
            const rand = Math.random() * 6;
            if (people[currentPerson] === 'DOM' && !steveReichPlaying && rand >= 4.0) {
                sendSteveReich();
            }
        }
        // reset when we run out.
        if (!currentLongSamples.length) {
            currentPerson++;
            if (currentPerson === people.length) {
                currentPerson = 0;
            }
            personLongSamples = audioSamples.getLongSamplesForPerson(people[currentPerson]);
            currentLongSamples = personLongSamples.slice(0);
        }
    };

    const playNextQuoteSample = () => {
        const choice = Math.floor(Math.random() * currentQuoteSamples.length);
        const sample = currentQuoteSamples.splice(choice, 1);
        if (sample && sample[0]) {
            console.log('playing quote sample ', sample[0]);
            sendSample(sample[0], 'quote');
            quoteSamplePlaying = true;
            // reset when we run out.
            if (!currentQuoteSamples.length) {
                currentPerson++;
                currentQuoteSamples = allQuoteSamples.slice(0);
            }
        }
    };

    const playNextSynth = () => {
        const choice = Math.floor(Math.random() * currentSynths.length);
        const synth = currentSynths.splice(choice, 1);
        sendSynth(synth[0]);
        synthPlaying = true;
        if (!currentSynths.length) {
            currentSynths = synths.slice(0);
        }
    };

    const oscMessageHandler = (msg) => {
	if(!serverReady) {
	    console.log('sonic-pi server is ready');
	    serverReady = true;
	}
        const { address } = msg;
        switch (address) {
            case '/sample-finished/hitz':
                break;
            case '/sample-finished/quote':
                setTimeout(() => { quoteSamplePlaying = false }, TIME_BETWEEN_QUOTE_SAMPLES);
                break;
            case '/sample-finished/long':
                setTimeout(() => { idleSamplePlaying = false }, TIME_BETWEEN_LONG_SAMPLES);
                break;
            case '/synth-finished':
                setTimeout(() => { synthPlaying = false }, TIME_BETWEEN_SYNTHS);
                break;
            case '/drums-finished':
                setTimeout(() => { drumsPlaying = false }, TIME_BETWEEN_DRUMS);
                break;
            case '/ambient-finished':
                setTimeout(() => { ambientPlaying = false }, TIME_BETWEEN_SYNTHS);
                break;
            case '/steve-reich-finished':
                setTimeout(() => { steveReichPlaying = false }, TIME_BETWEEN_LONG_SAMPLES);
                break;
	    default:
                console.log('oscMessageHandler ', msg);
                break;
        }
    };
    oscServer.addOSCListener(oscMessageHandler);
    // sendDrums(1);

    setInterval(async () => {
        currTime = new Date().getTime();
        // Read inputs - for changes
        const triggeredInputs = await Promise.all(inputChecks.map(triggerCheck => triggerCheck()));

        let nothingTriggered = true;
        let triggerCount = 0;
        triggeredInputs.forEach((isTriggered, idx) => {
            if (isTriggered) {
                const inputTimes = inputActivity[idx];
                inputTimes.push(currTime);
                if (inputTimes.length > MAX_INPUT_TIMES) {
                    inputTimes.shift();
                }
                if (currentMode === MODE_IDLE) {
                    setMode(MODE_HITZ);
                }
                // Only measure this once in the loop
                if (nothingTriggered) {
                    overallInputActivity.push(currTime);
                    if (overallInputActivity.length > MAX_INPUT_TIMES) {
                        overallInputActivity.shift();
                    }
                }
                // console.log('inputTimes is now ', inputActivity[idx]);
                const quotes = Math.floor(Math.random() * 5);
                if (quotes >= 4 && !quoteSamplePlaying) {
                    playNextQuoteSample();
                } else {
                    playNextHitzSample(); // Should we block on quoteSamplePlaying?
                }
                nothingTriggered = false;
                triggerCount++;
            }
        });

        timeInMode += currTime - lastTime; // do this here?

        let avgActivity = 0;
        if (nothingTriggered && currentMode !== MODE_IDLE && timeInMode > TIME_TO_IDLE) {
            setMode(MODE_IDLE);
        } else if (currentMode === MODE_IDLE && lastMode === currentMode) {
            if (timeInMode > IDLE_TIME_BEFORE_SAMPLE && !idleSamplePlaying) {
                playNextLongSample();
            }
        } else if (!nothingTriggered) {
            const sumActivity = overallInputActivity.reduce((acc, curr, idx, src) => {
                let delta = 0;
                if (idx > 0) {
                    delta = curr - src[idx - 1];
                }
                return acc + delta;
            }, 0);
            avgActivity = 500.0 / (sumActivity / overallInputActivity.length);
            // console.log('overallInputActivity is now ', overallInputActivity, avgActivity, sumActivity);
            // Do we loop through each 'inputTimes' and calculate their mode?
        }

        if (avgActivity > 0.5 && !synthPlaying) {
            playNextSynth();
        }
        if (avgActivity > 0.7 && !ambientPlaying) {
            const choice = Math.ceil(Math.random() * AMBIENT_SAMPLES);
            sendAmbient(Math.trunc(choice));
            ambientPlaying = true;
        }
        if (triggerCount === 2 && !drumsPlaying) {
            sendDrums(1); // Allow for 'random' drums?
            drumsPlaying = true;
        }
        // Also check which input, e.g. 1 + 2 + 3 affects mode!
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
        lastTime = currTime;
        lastMode = currentMode;
    }, LOOP_INTERVAL);

}



const sampleDir = '../samples/'
// Need to read directory recursively and build up
// 'set' of samples so we can access 'HITZ' & 'QUOTES' separately.
const main = async () => {
    try {
        const sampleFiles = await audioSamples.loadSamples(sampleDir);

        await setupPin(IN_1);
        await setupPin(IN_2);
        await setupPin(IN_3);
        // Start sonic-pi and wait for 'ready'?
        await run(sampleFiles);
    } catch(err) {
        oscServer.shutdownOSC();
        console.log(err);
        process.exit(-1);
    }
}

main();

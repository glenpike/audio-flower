const Speaker = require('speaker');
const fs = require('fs');

const debug = true;

const triggerAudio = () => {
  const speaker = new Speaker({
    channels: 2,
    bitDepth: 16,
    sampleRate: 44100,
  });
  const audioFile = 'audio/chris/wanted-a-job.wav';

  const audioSrc = fs.createReadStream(audioFile);
  audioSrc.pipe(speaker);
};

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
  if (debug) {
    console.log(`sensorValue: ${sensorValue} (${value})`);
  }
  if (sensorValue > triggerThreshold && !triggered) {
    console.log('triggering...');
    triggerAudio();
    triggered = true;
  } else if(sensorValue < resetThreshold && triggered) {
    console.log('resetting trigger...');
    triggered = false;
  }
};

let buffer = '';
port.on('readable', function () {
  buffer += port.read().toString();
  const messages = buffer.split('\n');
  if (messages.length > 1) {
    // save the bit for the buffer.
    buffer = messages.pop();
    messages.forEach((m) => {
      const regex = /([0-9]+)\t([0-9]+)/;
      const match = m.match(regex);
      // console.log('match ', match);
      if (match) {
        const [, time, value] = match;
        handleData({ time, value});
      }
    });
  }
});
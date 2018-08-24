const Speaker = require('speaker');
const fs = require('fs');

const speaker = new Speaker({
  channels: 2,
  bitDepth: 16,
  sampleRate: 44100,
});

const audioFile = 'audio/chris/wanted-a-job.wav';

const audioSrc = fs.createReadStream(audioFile);
audioSrc.pipe(speaker);
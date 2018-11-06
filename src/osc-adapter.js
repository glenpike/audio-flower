const oscMin = require('osc-min');
const dgram = require('dgram');

const sock = dgram.createSocket("udp4", function(msg, rinfo) {
  try {
    return console.log(oscMin.fromBuffer(msg));
  } catch (error) {
    return console.log('invalid OSC packet ', error);
  }
});

sock.bind(4559);
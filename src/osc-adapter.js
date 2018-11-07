const oscMin = require('osc-min');
const dgram = require('dgram');
// This is the port we're listening on.
const localPort = 57122;

// This is where sonic-pi is listening for OSC messages.
const remotePort = 4559;
const remoteAddress = '127.0.0.1';

// Setup the UDP server for receiving messages.
const server = dgram.createSocket('udp4');

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.on('error', (error) => {
  console.error('OSC Server error ', error);
  server.close();
  throw new Error('Osc Server failed'); // Will be uncaught, but supervisord may be able to help!
});

server.bind(localPort);

const addOSCListener = (oscMessageHandler) => {
  server.on('message', (msg, rinfo) => {
    try {
      oscMessageHandler(oscMin.fromBuffer(msg));
    } catch (error) {
      console.warn('invalid OSC packet ', error);
    }
  });
};

// Setup the client socket for sending.
const client = dgram.createSocket('udp4');

const sendOSCMessage = (msg) => {
  const buf = oscMin.toBuffer(msg);
  // console.log('sending OSC msg ', msg);
  client.send(buf, 0, buf.length, remotePort, remoteAddress, (error) => {
    if (error) {
      console.warn('error sending OSC msg ', error);
      client.close();
    }
  });
};

const shutdownOSC = () => {
  client.close();
  server.close();
};

module.exports = {
  addOSCListener,
  sendOSCMessage,
  shutdownOSC,
};

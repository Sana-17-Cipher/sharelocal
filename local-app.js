const WebSocket = require('ws');

const ws = new WebSocket('wss://sharelocal-rspp.onrender.com');
// (use ws://localhost:4000 for local testing)
// (use wss://sharelocal-rspp.onrender.com for production)
let myClientId = null;

ws.on('open', () => {
  console.log('Connected to relay server, waiting for ID...');
});

ws.on('message', async (raw) => {
  const msg = JSON.parse(raw.toString());

  if (msg.type === 'connected') {
    myClientId = msg.clientId;
    console.log(`My ShareLocal URL: https://sharelocal-rspp.onrender.com/${myClientId}`);
  }

  if (msg.type === 'request') {
    const response = await fetch('http://localhost:5173/');
    const data = await response.text();
    ws.send(JSON.stringify({ requestId: msg.requestId, body: data }));
  }
});
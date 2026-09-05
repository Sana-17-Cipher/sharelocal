const WebSocket = require('ws');

const ws = new WebSocket('wss://sharelocal-rspp.onrender.com');

ws.on('open', () => {
  console.log('Connected to relay server!');
});

ws.on('message', async (message) => {
  console.log('Relay asked me for something');
  // Fetch from our real local app (Vite would be here in real life)
  const response = await fetch('http://localhost:5173/');
  const data = await response.text();
  ws.send(data);
});
const express = require('express');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Relay server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });
let clientSocket = null;

wss.on('connection', (ws) => {
  console.log('A client (someone\'s laptop) connected!');
  clientSocket = ws;

  ws.on('message', (data) => {
    if (res_waiting) {
      res_waiting.send(data.toString());
      res_waiting = null;
    }
  });
});

let res_waiting = null;

app.get('/', (req, res) => {
  if (!clientSocket) {
    return res.status(502).send('No laptop connected.');
  }
  res_waiting = res;
  clientSocket.send('give me the page');
});
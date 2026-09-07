const express = require('express');
const WebSocket = require('ws');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Relay server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

const clients = new Map();       // clientId -> socket
const pendingRequests = new Map(); // requestId -> res object

wss.on('connection', (ws) => {
  const clientId = crypto.randomBytes(4).toString('hex');
  clients.set(clientId, ws);
  console.log(`Client connected: ${clientId}`);

  ws.send(JSON.stringify({ type: 'connected', clientId }));

  ws.on('message', (raw) => {
	const msg = JSON.parse(raw.toString());
	const pending = pendingRequests.get(msg.requestId);
	if (pending) {
		const buffer = Buffer.from(msg.body, 'base64');
		pending.status(msg.status || 200);
		pending.set('Content-Type', msg.contentType);
		pending.send(buffer);
		pendingRequests.delete(msg.requestId);
	}
});

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  });
});
app.get('/:clientId', (req, res) => {
	const clientSocket = clients.get(req.params.clientId);
	if (!clientSocket) {
		return res.status(502).send('No laptop connected with that ID.');
	}

	const requestId = crypto.randomBytes(4).toString('hex');
	pendingRequests.set(requestId, res);

	clientSocket.send(JSON.stringify({ type: 'request', requestId, path: '/' }));
});

app.get('/:clientId/*splat', (req, res) => {
	const clientSocket = clients.get(req.params.clientId);
	if (!clientSocket) {
		return res.status(502).send('No laptop connected with that ID.');
	}

	const requestId = crypto.randomBytes(4).toString('hex');
	pendingRequests.set(requestId, res);

	const splatParts = req.params.splat || [];
	const path = '/' + splatParts.join('/');

	clientSocket.send(JSON.stringify({ type: 'request', requestId, path }));
});
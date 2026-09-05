# ShareLocal

A tunneling tool that exposes your local dev server to the internet, similar to ngrok.

## How it works
- `relay-server.js` — deployed relay, tracks connected clients by ID, routes requests to them over WebSocket
- `local-app.js` — runs on your laptop, connects outbound to the relay, fetches from your real local dev server
- Each connected laptop gets a unique URL: `https://sharelocal-rspp.onrender.com/<clientId>`

## Status
MVP working: multi-client WebSocket tunneling, deployed relay on Render.
Next: VS Code extension, friendly subdomains, security.
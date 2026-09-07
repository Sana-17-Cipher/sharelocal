import * as vscode from 'vscode';
import WebSocket from 'ws';

let ws: WebSocket | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('ShareLocal extension is now active!');

	const shareCommand = vscode.commands.registerCommand('sharelocal-extension.share', () => {
		startTunnel();
	});

	const stopCommand = vscode.commands.registerCommand('sharelocal-extension.stop', () => {
		if (ws) {
			ws.close();
			ws = undefined;
			vscode.window.showInformationMessage('ShareLocal stopped.');
		} else {
			vscode.window.showInformationMessage('No active ShareLocal tunnel.');
		}
	});

	context.subscriptions.push(shareCommand, stopCommand);
}

function startTunnel() {
	ws = new WebSocket('wss://sharelocal-rspp.onrender.com');

	ws.on('open', () => {
		vscode.window.showInformationMessage('Connected to ShareLocal relay, waiting for URL...');
	});

	ws.on('message', async (raw: Buffer) => {
		const msg = JSON.parse(raw.toString());

		if (msg.type === 'connected') {
			const url = `https://sharelocal-rspp.onrender.com/${msg.clientId}`;
			vscode.window.showInformationMessage(
				`ShareLocal is live: ${url}`,
				'Copy URL'
			).then(selection => {
				if (selection === 'Copy URL') {
					vscode.env.clipboard.writeText(url);
					vscode.window.showInformationMessage('URL copied to clipboard!');
				}
			});
		}

		if (msg.type === 'request') {
			try {
				const response = await fetch('http://localhost:5173/');
				const data = await response.text();
				ws!.send(JSON.stringify({ requestId: msg.requestId, body: data }));
			} catch (err) {
				console.error('Could not reach local server', err);
			}
		}
	});

	ws.on('close', () => {
		vscode.window.showInformationMessage('ShareLocal tunnel closed.');
	});
}

export function deactivate() {
	if (ws) {
		ws.close();
	}
}
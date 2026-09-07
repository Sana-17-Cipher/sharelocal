import * as vscode from 'vscode';
import WebSocket from 'ws';

let ws: WebSocket | undefined;
let lastUsedPort = '5173';
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	console.log('ShareLocal extension is now active!');

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItem.text = '$(circle-outline) ShareLocal: Off';
	statusBarItem.command = 'sharelocal-extension.share';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	const shareCommand = vscode.commands.registerCommand('sharelocal-extension.share', async () => {
		const port = await vscode.window.showInputBox({
			prompt: 'Which local port do you want to share?',
			placeHolder: '5173',
			value: lastUsedPort
		});

		if (!port) {
			return;
		}

		lastUsedPort = port;
		startTunnel(port);
	});

	const stopCommand = vscode.commands.registerCommand('sharelocal-extension.stop', () => {
		if (ws) {
			ws.close();
			ws = undefined;
			statusBarItem.text = '$(circle-outline) ShareLocal: Off';
			statusBarItem.tooltip = undefined;
			vscode.window.showInformationMessage('ShareLocal stopped.');
		} else {
			vscode.window.showInformationMessage('No active ShareLocal tunnel.');
		}
	});

	context.subscriptions.push(shareCommand, stopCommand);
}

function startTunnel(port: string) {
	ws = new WebSocket('wss://sharelocal-rspp.onrender.com');

	ws.on('open', () => {
		vscode.window.showInformationMessage('Connected to ShareLocal relay, waiting for URL...');
	});

	ws.on('message', async (raw: Buffer) => {
		const msg = JSON.parse(raw.toString());

		if (msg.type === 'connected') {
			const url = `https://sharelocal-rspp.onrender.com/${msg.clientId}`;

			statusBarItem.text = `$(radio-tower) ShareLocal: Live`;
			statusBarItem.tooltip = url;

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
				const response = await fetch(`http://localhost:${port}${msg.path}`);
				const contentType = response.headers.get('content-type') || 'text/plain';
				const arrayBuffer = await response.arrayBuffer();
				const base64Body = Buffer.from(arrayBuffer).toString('base64');

				ws!.send(JSON.stringify({
					requestId: msg.requestId,
					status: response.status,
					contentType,
					body: base64Body
				}));
			} catch (err) {
				console.error('Could not reach local server', err);
			}
		}
	});

	ws.on('close', () => {
		statusBarItem.text = '$(circle-outline) ShareLocal: Off';
		statusBarItem.tooltip = undefined;
		vscode.window.showInformationMessage('ShareLocal tunnel closed.');
	});
}

export function deactivate() {
	if (ws) {
		ws.close();
	}
}
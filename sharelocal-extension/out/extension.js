"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ws_1 = __importDefault(require("ws"));
let ws;
function activate(context) {
    console.log('ShareLocal extension is now active!');
    const shareCommand = vscode.commands.registerCommand('sharelocal-extension.share', () => {
        startTunnel();
    });
    const stopCommand = vscode.commands.registerCommand('sharelocal-extension.stop', () => {
        if (ws) {
            ws.close();
            ws = undefined;
            vscode.window.showInformationMessage('ShareLocal stopped.');
        }
        else {
            vscode.window.showInformationMessage('No active ShareLocal tunnel.');
        }
    });
    context.subscriptions.push(shareCommand, stopCommand);
}
function startTunnel() {
    ws = new ws_1.default('wss://sharelocal-rspp.onrender.com');
    ws.on('open', () => {
        vscode.window.showInformationMessage('Connected to ShareLocal relay, waiting for URL...');
    });
    ws.on('message', async (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'connected') {
            const url = `https://sharelocal-rspp.onrender.com/${msg.clientId}`;
            vscode.window.showInformationMessage(`ShareLocal is live: ${url}`, 'Copy URL').then(selection => {
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
                ws.send(JSON.stringify({ requestId: msg.requestId, body: data }));
            }
            catch (err) {
                console.error('Could not reach local server', err);
            }
        }
    });
    ws.on('close', () => {
        vscode.window.showInformationMessage('ShareLocal tunnel closed.');
    });
}
function deactivate() {
    if (ws) {
        ws.close();
    }
}
//# sourceMappingURL=extension.js.map
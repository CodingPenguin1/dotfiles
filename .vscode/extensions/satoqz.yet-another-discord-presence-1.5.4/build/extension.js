"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const client_1 = require("./client");
const listener_1 = require("./listener");
const parser_1 = require("./parser");
const config = vscode_1.workspace.getConfiguration("RPC");
const client = new client_1.Client(config);
const parser = new parser_1.Parser(client);
const listener = new listener_1.Listener(parser);
let active = false;
function _activate() {
    client.connect();
    parser.makeInitial();
    listener.listen();
    active = true;
}
function activate(ctx) {
    if (config.get("ignoreWorkspaces").includes(vscode_1.workspace.name))
        return;
    _activate();
    ctx.subscriptions.push(client.statusBar, vscode_1.commands.registerCommand("RPC.reconnect", reconnect), vscode_1.commands.registerCommand("RPC.disconnect", deactivate));
}
exports.activate = activate;
function deactivate() {
    client.disconnect();
    listener.dispose();
    active = false;
}
exports.deactivate = deactivate;
function reconnect() {
    deactivate();
    _activate();
}
if (config.get("checkIdle")) {
    const timeout = config.get("idleTimeout") * 1000;
    const doDeactivate = config.get("disconnectOnIdle");
    vscode_1.window.onDidChangeWindowState(({ focused }) => {
        if (!focused)
            setTimeout(() => {
                if (!vscode_1.window.state.focused) {
                    if (doDeactivate) {
                        if (active)
                            deactivate();
                    }
                    else
                        parser.idle(true);
                }
            }, timeout);
        else {
            if (!active)
                _activate();
            else if (!doDeactivate)
                parser.idle(false);
        }
    });
}

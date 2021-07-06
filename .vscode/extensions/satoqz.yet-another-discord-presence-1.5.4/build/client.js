"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const discord_rpc_1 = require("discord-rpc");
const vscode_1 = require("vscode");
class Client {
    config;
    constructor(config) {
        this.config = config;
    }
    set(options) {
        if (!this.ready)
            this.rpc.once("ready", () => this._set(options));
        else
            this._set(options);
    }
    _set(options) {
        if (this.rpc)
            this.rpc.setActivity(options).catch(() => this.disconnect());
    }
    disconnect() {
        if (this.rpc)
            this.rpc.destroy();
        this.ready = false;
        this.statusBar.text = "$(radio-tower)";
        this.statusBar.tooltip =
            "Disconnected from Discord. Click to reconnect.";
        this.statusBar.command = "RPC.reconnect";
    }
    connect() {
        if (!this.statusBar)
            this.statusBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, 100);
        this.statusBar.text = "$(pulse)";
        this.statusBar.tooltip = "RPC Connecting to Discord...";
        if (this.config.get("showStatusBar") == true)
            this.statusBar.show();
        this.rpc = new discord_rpc_1.Client({ transport: "ipc" });
        this.rpc
            .login({ clientId: this.config.get("clientID") })
            .catch(() => this.disconnect());
        this.rpc.once("ready", () => {
            this.ready = true;
            this.statusBar.text = "$(vm-active)";
            this.statusBar.tooltip = "RPC Connected to Discord";
            this.statusBar.command = null;
        });
    }
    ready = false;
    rpc;
    statusBar;
}
exports.Client = Client;

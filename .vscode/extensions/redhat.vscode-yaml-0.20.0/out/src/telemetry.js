"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryOutputChannel = exports.TelemetryErrorHandler = void 0;
const node_1 = require("vscode-languageclient/node");
const vscode = require("vscode");
class TelemetryErrorHandler {
    constructor(telemetry, name, maxRestartCount) {
        this.telemetry = telemetry;
        this.name = name;
        this.maxRestartCount = maxRestartCount;
        this.restarts = [];
    }
    error(error, message, count) {
        this.telemetry.send({ name: 'yaml.lsp.error', properties: { jsonrpc: message.jsonrpc, error: error.message } });
        if (count && count <= 3) {
            return node_1.ErrorAction.Continue;
        }
        return node_1.ErrorAction.Shutdown;
    }
    closed() {
        this.restarts.push(Date.now());
        if (this.restarts.length <= this.maxRestartCount) {
            return node_1.CloseAction.Restart;
        }
        else {
            const diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
            if (diff <= 3 * 60 * 1000) {
                vscode.window.showErrorMessage(`The ${this.name} server crashed ${this.maxRestartCount + 1} times in the last 3 minutes. The server will not be restarted.`);
                return node_1.CloseAction.DoNotRestart;
            }
            else {
                this.restarts.shift();
                return node_1.CloseAction.Restart;
            }
        }
    }
}
exports.TelemetryErrorHandler = TelemetryErrorHandler;
class TelemetryOutputChannel {
    constructor(delegate, telemetry) {
        this.delegate = delegate;
        this.telemetry = telemetry;
    }
    get name() {
        return this.delegate.name;
    }
    append(value) {
        this.checkError(value);
        this.delegate.append(value);
    }
    appendLine(value) {
        this.checkError(value);
        this.delegate.appendLine(value);
    }
    checkError(value) {
        if (value.startsWith('[Error') || value.startsWith('  Message: Request')) {
            this.telemetry.send({ name: 'yaml.server.error', properties: { error: value } });
        }
    }
    clear() {
        this.delegate.clear();
    }
    show(column, preserveFocus) {
        this.delegate.show(column, preserveFocus);
    }
    hide() {
        this.delegate.hide();
    }
    dispose() {
        this.delegate.dispose();
    }
}
exports.TelemetryOutputChannel = TelemetryOutputChannel;
//# sourceMappingURL=telemetry.js.map
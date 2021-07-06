"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
const vscode_1 = require("vscode");
class Listener {
    parser;
    constructor(parser) {
        this.parser = parser;
        this.config = parser.config;
    }
    listen() {
        this.dispose();
        const fileSwitch = vscode_1.window.onDidChangeActiveTextEditor, fileEdit = vscode_1.workspace.onDidChangeTextDocument, debugStart = vscode_1.debug.onDidStartDebugSession, debugEnd = vscode_1.debug.onDidTerminateDebugSession, diagnostictsChange = vscode_1.languages.onDidChangeDiagnostics;
        if (this.config.get("showFile"))
            this.disposables.push(fileSwitch((e) => this.parser.fileSwitch(e)), fileEdit((e) => this.parser.fileEdit(e)));
        if (this.config.get("showDebugging"))
            this.disposables.push(debugStart(() => this.parser.toggleDebug()), debugEnd(() => this.parser.toggleDebug()));
        if (this.config.get("showProblems"))
            this.disposables.push(diagnostictsChange(() => this.parser.diagnosticsChange()));
    }
    disposables = [];
    config;
    dispose() {
        this.disposables.forEach((disposable) => disposable.dispose());
    }
}
exports.Listener = Listener;

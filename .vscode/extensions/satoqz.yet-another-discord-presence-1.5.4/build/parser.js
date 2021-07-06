"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const vscode_1 = require("vscode");
const util_1 = require("./util");
const isInsiders = vscode_1.env.appName.toLowerCase().includes("insiders");
const vsicon = isInsiders ? "insiders" : "vscode";
const placeholderKey = isInsiders
    ? "placeholderTextInsiders"
    : "placeholderText";
class Parser {
    client;
    constructor(client) {
        this.client = client;
        this.config = client.config;
    }
    makeInitial() {
        if (this.config.get("showTime"))
            this.presence.startTimestamp = Date.now();
        const placeholder = this.config.get(placeholderKey);
        this.presence.largeImageKey = vsicon;
        this.presence.largeImageText = placeholder;
        this.presence.smallImageKey = vsicon;
        this.presence.smallImageText = placeholder;
        if (this.config.get("showWorkspace") &&
            !this.config.get("hideWorkspaces").includes(vscode_1.workspace.name))
            this.presence.state = this.makeState({ initial: true });
        this.update();
    }
    makeDetails(type, info) {
        if (this.debugging)
            type = "debuggingText";
        const excludeFile = this.config
            .get("hideFiles")
            .includes(info.fileName);
        const activityString = this.config
            .get(type)
            .replace(/{file}/g, excludeFile ? "a file" : info.fileName)
            .replace(/{extension}/g, info.extension);
        const problemString = this.config.get("showProblems")
            ? this.config
                .get("problemsText")
                .replace(/{count}/g, this.problems.toString())
            : "";
        return `${activityString} ${problemString}`;
    }
    makeState({ info, initial = false, }) {
        return this.config
            .get("workspaceText")
            .replace(/{workspace}/g, vscode_1.workspace.name ?? "no workspace")
            .replace(/{folder}/g, initial ? "no folder" : info.folder);
    }
    makeFileInfo(document) {
        const linecount = document.lineCount;
        const currentline = vscode_1.window.activeTextEditor.selection.active.line + 1 > linecount
            ? linecount
            : vscode_1.window.activeTextEditor.selection.active.line + 1;
        return this.config
            .get("fileInfoText")
            .replace(/{linecount}/g, linecount.toString())
            .replace(/{currentline}/g, currentline.toString())
            .replace(/{language}/g, document.languageId);
    }
    fileSwitch(editor) {
        if (editor) {
            const info = new util_1.PathInfo(editor.document);
            this.presence.largeImageKey = info.icon;
            this.presence.details = this.makeDetails("viewingText", info);
            this.presence.state = this.makeState({ info });
            if (this.config.get("showFileInfo"))
                this.presence.largeImageText = this.makeFileInfo(editor.document);
        }
        else {
            this.presence.largeImageKey = vsicon;
            this.presence.details = undefined;
            this.presence.largeImageText = this.config.get(placeholderKey);
        }
        this.update();
    }
    fileEdit({ document }) {
        if (document.fileName.endsWith(".git") || document.languageId == "scminput")
            return;
        const info = new util_1.PathInfo(document);
        this.presence.largeImageKey = info.icon;
        this.presence.details = this.makeDetails("editingText", info);
        this.presence.state = this.makeState({ info });
        if (this.config.get("showFileInfo"))
            this.presence.largeImageText = this.makeFileInfo(document);
        this.update();
    }
    toggleDebug() {
        this.debugging = !this.debugging;
    }
    diagnosticsChange() {
        const diag = vscode_1.languages.getDiagnostics();
        let counted = 0;
        diag.forEach((i) => {
            if (i[1])
                i[1].forEach((i) => {
                    if (i.severity == vscode_1.DiagnosticSeverity.Warning ||
                        i.severity == vscode_1.DiagnosticSeverity.Error)
                        counted++;
                });
        });
        this.problems = counted;
    }
    idle(value) {
        this.presence.smallImageKey = value ? "inactive" : vsicon;
        this.presence.smallImageText = value
            ? this.config.get("idleText")
            : this.config.get(placeholderKey);
        this.update();
    }
    update() {
        this.client.set(this.presence);
    }
    debugging = false;
    problems = 0;
    presence = {};
    config;
}
exports.Parser = Parser;

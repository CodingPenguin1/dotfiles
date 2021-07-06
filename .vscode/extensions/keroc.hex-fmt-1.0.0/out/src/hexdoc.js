"use strict";
const vscode_1 = require("vscode");
const hexline_1 = require("./hexline");
class HexDocument {
    updateStatusBar() {
        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        }
        // Get the current text editor
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }
        let pos = editor.selection.active;
        let doc = editor.document;
        // Only update status if an Hex file
        if (doc.languageId === "hex") {
            this._updateDoc(doc);
            // Update the size
            if (this._size < 1024) {
                this._statusBarItem.text = `$(file-binary) ${this._size} B`;
            }
            else {
                let showableSize = this._size / 1024;
                this._statusBarItem.text = `$(file-binary) ${showableSize} KB`;
            }
            // Update the address
            if (this._hexLines[pos.line].isData()) {
                let address = this._hexLines[pos.line].charToAddress(pos.character);
                if (address >= 0) {
                    this._statusBarItem.text += ` $(mention) 0x${address.toString(16).toUpperCase()}`;
                }
            }
            this._statusBarItem.show();
        }
        else {
            this._statusBarItem.hide();
        }
    }
    goToAddress(address) {
        for (let i = 0; i < this._hexLines.length; i++) {
            let char = this._hexLines[i].addressToChar(address);
            if (char >= 0) {
                // Get the current text editor
                let editor = vscode_1.window.activeTextEditor;
                let pos = new vscode_1.Position(i, char);
                let sel = new vscode_1.Selection(pos, pos);
                // Set the new position
                editor.selection = sel;
                return true;
            }
        }
        return false;
    }
    repair() {
        // Create the workspace edit
        let workspaceEdit = new vscode_1.WorkspaceEdit();
        let doc = vscode_1.window.activeTextEditor.document;
        let edits = [];
        for (let i = 0; i < this._hexLines.length; i++) {
            if (this._hexLines[i].isBroken()) {
                if (this._hexLines[i].repair()) {
                    // Build the text Edit
                    let range = doc.lineAt(i).range;
                    edits.push(new vscode_1.TextEdit(range, this._hexLines[i].toString()));
                }
            }
        }
        // Do the edition
        if (edits.length > 0) {
            workspaceEdit.set(doc.uri, edits);
            vscode_1.workspace.applyEdit(workspaceEdit);
        }
        return edits.length;
    }
    _updateDoc(doc) {
        let offset = 0;
        this._hexLines = [];
        this._size = 0;
        for (let i = 0; i < doc.lineCount; i++) {
            this._hexLines.push(new hexline_1.HexLine(doc.lineAt(i).text, offset));
            // Update size
            this._size += this._hexLines[i].size();
            // Check if a new offset is set
            if (this._hexLines[i].isExtendedAddress()) {
                offset = this._hexLines[i].extAddress();
            }
        }
    }
    dispose() {
        this._statusBarItem.dispose();
    }
}
exports.HexDocument = HexDocument;
//# sourceMappingURL=hexdoc.js.map
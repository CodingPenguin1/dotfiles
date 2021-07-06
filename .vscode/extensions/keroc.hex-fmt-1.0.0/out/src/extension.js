'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const hexdoc_1 = require("./hexdoc");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // create a new HexDocument
    let hexDoc = new hexdoc_1.HexDocument();
    let controller = new HexDocumentController(hexDoc);
    var seekDisposable = vscode_1.commands.registerCommand('extension.hexFind', () => {
        // Check this is a .hex file
        if (vscode_1.window.activeTextEditor.document.languageId != "hex") {
            vscode_1.window.showErrorMessage("This command is only available with \".hex\" files.");
            return;
        }
        // Display a message box to the user
        vscode_1.window.showInputBox({ prompt: 'Type an adress to find' }).then(val => {
            let address = parseInt(val);
            if (address === NaN || address < 0) {
                vscode_1.window.showErrorMessage("Wrong address format.");
                return;
            }
            // Go to the address
            if (!hexDoc.goToAddress(address)) {
                vscode_1.window.showWarningMessage("The address 0x" + address.toString(16) + " was not found.");
            }
        });
    });
    var repairDisposable = vscode_1.commands.registerCommand('extension.repairHex', () => {
        // Check this is a .hex file
        if (vscode_1.window.activeTextEditor.document.languageId != "hex") {
            vscode_1.window.showErrorMessage("This command is only available with \".hex\" files.");
            return;
        }
        // Repair the document
        let nbRep = hexDoc.repair();
        if (nbRep > 0) {
            vscode_1.window.showInformationMessage((nbRep === 1) ? "1 record has been repaired." : nbRep + " records have been repaired");
        }
        else {
            vscode_1.window.showInformationMessage("Nothing has been done.");
        }
    });
    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(repairDisposable);
    context.subscriptions.push(seekDisposable);
    context.subscriptions.push(controller);
    context.subscriptions.push(hexDoc);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
class HexDocumentController {
    constructor(hexDoc) {
        this._hexDoc = hexDoc;
        // Start right now by updating the document
        this._hexDoc.updateStatusBar();
        // Subscribe to text change event
        let subscriptions = [];
        vscode_1.window.onDidChangeActiveTextEditor(this._onEdit, this, subscriptions);
        vscode_1.window.onDidChangeTextEditorSelection(this._onEdit, this, subscriptions);
        vscode_1.workspace.onDidSaveTextDocument(this._onSave, this, subscriptions);
        // Create a combined disposable
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        this._disposable.dispose();
    }
    _onEdit() {
        this._hexDoc.updateStatusBar();
    }
    _onSave() {
        // Check this is an .hex file
        if (vscode_1.window.activeTextEditor.document.languageId === "hex" &&
            vscode_1.workspace.getConfiguration("hex-fmt").get("repairOnSave", false)) {
            // Repair and save if needed
            if (this._hexDoc.repair() > 0) {
                vscode_1.window.activeTextEditor.document.save();
            }
        }
    }
}
//# sourceMappingURL=extension.js.map
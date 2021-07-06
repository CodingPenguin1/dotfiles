'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class PeekFileDefinitionProvider {
    constructor() { }
    getComponentName(position) {
        const doc = vscode.window.activeTextEditor.document;
        const selection = doc.getWordRangeAtPosition(position);
        const selectedText = doc.getText(selection);
        let possibleFileNames = [];
        possibleFileNames.push(selectedText + '.m');
        return possibleFileNames;
    }
    getNestedFuncPosition(position) {
        const doc = vscode.window.activeTextEditor.document;
        const selection = doc.getWordRangeAtPosition(position);
        const selectedText = doc.getText(selection);
        for (let lineNb = 0; lineNb < doc.lineCount; lineNb++) {
            const txtLine = doc.lineAt(lineNb);
            if (!txtLine.isEmptyOrWhitespace) {
                const content = txtLine.text;
                const Colfunc = content.indexOf('function ');
                const ColName1 = content.indexOf(selectedText + '(');
                const ColName2 = content.indexOf(selectedText + ' (');
                if (Colfunc != -1 && (ColName1 != -1 || ColName2 != -1)) {
                    return [lineNb, Colfunc];
                }
            }
        }
        return [];
    }
    searchFilePath(fileName) {
        return vscode.workspace.findFiles(`**/${fileName}`, '**/node_modules'); // Returns promise
    }
    provideDefinition(document, position, token) {
        let filePaths = [];
        const componentNames = this.getComponentName(position);
        const searchPathActions = componentNames.map(this.searchFilePath);
        const searchPromises = Promise.all(searchPathActions); // pass array of promises
        const posInFile = this.getNestedFuncPosition(position);
        return searchPromises.then((paths) => {
            filePaths = [].concat.apply([], paths);
            if (filePaths.length) {
                console.log(posInFile);
                let allPaths = [];
                filePaths.forEach(filePath => {
                    allPaths.push(new vscode.Location(vscode.Uri.file(`${filePath.path}`), new vscode.Position(0, 1)));
                });
                return allPaths;
            }
            else {
                if (posInFile.length) {
                    let allPaths = [];
                    allPaths.push(new vscode.Location(document.uri, new vscode.Position(posInFile[0], posInFile[1])));
                    return allPaths;
                }
                else {
                    return undefined;
                }
            }
        }, (reason) => {
            return undefined;
        });
    }
}
exports.default = PeekFileDefinitionProvider;
//# sourceMappingURL=PeekFileDefinitionProvider.js.map
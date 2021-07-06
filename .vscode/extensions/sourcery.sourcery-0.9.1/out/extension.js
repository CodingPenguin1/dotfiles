'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const executable_1 = require("./executable");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const REFACTOR_WORKSPACE_REQUEST = new vscode_languageclient_1.RequestType('refactor_workspace');
function createLangServer(context) {
    const token = vscode_1.workspace.getConfiguration('sourcery').get('token');
    const packageJson = vscode_1.extensions.getExtension('sourcery.sourcery').packageJSON;
    const extensionVersion = packageJson.version;
    const command = path.join(__dirname, "..", "sourcery_binaries/" + executable_1.getExecutablePath());
    const serverOptions = {
        command,
        args: ['lsp'],
        options: {
            env: Object.assign({ PYTHONHASHSEED: '0' }, process.env)
        }
    };
    const clientOptions = {
        documentSelector: ['python'],
        synchronize: {
            configurationSection: 'sourcery'
        },
        initializationOptions: {
            'token': token,
            'editor_version': 'vscode ' + vscode_1.version,
            'extension_version': extensionVersion
        }
    };
    if (!token) {
        const readmePath = vscode_1.Uri.file(path.join(context.extensionPath, 'welcome-to-sourcery.py'));
        vscode_1.window.showTextDocument(readmePath);
        const result = vscode_1.window.showInputBox({
            placeHolder: 'Sourcery Token',
            prompt: 'Follow the instructions below to get your token.',
            ignoreFocusOut: true
        });
        result.then(function (value) {
            vscode_1.workspace.getConfiguration('sourcery').update('token', value, true);
        });
    }
    return new vscode_languageclient_1.LanguageClient(command, serverOptions, clientOptions);
}
function activate(context) {
    const languageClient = createLangServer(context);
    context.subscriptions.push(vscode_1.commands.registerCommand('sourcery.refactor.workspace', (resource, selected) => {
        let request = {
            command: 'refactoring/scan',
            arguments: [{
                    'uri': resource,
                    'all_uris': selected
                }]
        };
        languageClient.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, request);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('sourcery.clones.workspace', (resource, selected) => {
        let request = {
            command: 'clone/scan',
            arguments: [{
                    'uri': resource,
                    'all_uris': selected
                }]
        };
        languageClient.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, request);
    }));
    context.subscriptions.push(languageClient.start());
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map
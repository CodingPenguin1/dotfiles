'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cp = require("child_process");
const iconv = require("iconv-lite");
const errorsId_1 = require("./errorsId");
function check(document, lintOnSave = true, mlintPath = "") {
    var matlabLint = !lintOnSave ? Promise.resolve([]) : new Promise((resolve, reject) => {
        var filename = document.uri.fsPath;
        let matlabConfig = vscode.workspace.getConfiguration('matlab');
        let args = ['-all', '-id'];
        if (matlabConfig.has('linterConfig') && matlabConfig['linterConfig'] != null) {
            args.push(`-config=${matlabConfig['linterConfig']}`);
        }
        args.push(filename);
        let fileEncoding = 'utf8';
        if (matlabConfig.has('linterEncoding') && matlabConfig['linterEncoding'] != null) {
            fileEncoding = matlabConfig['linterEncoding'];
        }
        cp.execFile(mlintPath, args, { encoding: 'buffer' }, (err, stdout, stderr) => {
            try {
                let errorsString = iconv.decode(stderr, fileEncoding);
                var errors = errorsString.split('\n');
                var ret = [];
                errors.forEach(error => {
                    var regex = /L (\d+) \(C (\d+)-?(\d+)?\): (\S+): (.*)/;
                    var match = regex.exec(error);
                    if (match != null) {
                        var [_, lineStr, startCol, endCol, idErrorWarn, msg] = match;
                        var line = +lineStr;
                        if (endCol == null) {
                            endCol = startCol;
                        }
                        if (errorsId_1.ERROR_IDS.includes(idErrorWarn)) {
                            ret.push({ file: filename, line, column: [+startCol, +endCol], msg, severity: "error" });
                        }
                        else {
                            ret.push({ file: filename, line, column: [+startCol, +endCol], msg, severity: "warning" });
                        }
                    }
                });
                resolve(ret);
            }
            catch (error) {
                console.error(error);
                reject(error);
            }
        });
    });
    return Promise.all([matlabLint]).then(resultSets => [].concat.apply([], resultSets));
}
exports.check = check;
//# sourceMappingURL=matlabDiagnostics.js.map
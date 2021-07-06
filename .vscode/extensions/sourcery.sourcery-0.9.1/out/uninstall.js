'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const { exec } = require('child_process');
const executable_1 = require("./executable");
const command = path.join(__dirname, "..", "sourcery_binaries/" + executable_1.getExecutablePath() + " uninstall");
exec(command);
//# sourceMappingURL=uninstall.js.map
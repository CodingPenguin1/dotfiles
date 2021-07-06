"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncManager = void 0;
const Util_1 = require("../Util");
const StatusBarManager_1 = require("./StatusBarManager");
const SessionSummaryData_1 = require("../storage/SessionSummaryData");
const fs = require("fs");
class SyncManager {
    constructor() {
        // make sure the file exists
        SessionSummaryData_1.getSessionSummaryFileAsJson();
        // fs.watch replaces fs.watchFile and fs.unwatchFile
        fs.watch(Util_1.getSessionSummaryFile(), (curr, prev) => {
            if (curr === "change") {
                StatusBarManager_1.updateStatusBarWithSummaryData();
            }
        });
    }
    static getInstance() {
        if (!SyncManager._instance) {
            SyncManager._instance = new SyncManager();
        }
        return SyncManager._instance;
    }
}
exports.SyncManager = SyncManager;
//# sourceMappingURL=SyncManger.js.map
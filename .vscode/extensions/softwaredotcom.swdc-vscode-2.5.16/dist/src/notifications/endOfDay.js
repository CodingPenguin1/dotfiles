"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showEndOfDayNotification = exports.setEndOfDayNotification = void 0;
const vscode_1 = require("vscode");
const WebViewManager_1 = require("../managers/WebViewManager");
const Util_1 = require("../Util");
const HttpClient_1 = require("../http/HttpClient");
const ConfigManager_1 = require("../managers/ConfigManager");
const TrackerManager_1 = require("../managers/TrackerManager");
const TreeButtonProvider_1 = require("../tree/TreeButtonProvider");
const date_fns_1 = require("date-fns");
const MIN_IN_MILLIS = 60 * 1000;
const HOUR_IN_MILLIS = 60 * 60 * 1000;
let timer = undefined;
exports.setEndOfDayNotification = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // clear any existing timer
    if (timer) {
        clearTimeout(timer);
    }
    // If the end of day notification setting is turned on (if undefined or null, will default to true)
    if (((_b = (_a = user === null || user === void 0 ? void 0 : user.preferences) === null || _a === void 0 ? void 0 : _a.notifications) === null || _b === void 0 ? void 0 : _b.endOfDayNotification) !== false) {
        const jwt = Util_1.getItem("jwt");
        const d = new Date();
        const day = date_fns_1.format(d, "EEE").toLowerCase();
        let msUntilEndOfTheDay = 0;
        // [[118800,147600],[205200,234000],[291600,320400],[378000,406800],[464400,493200]]
        // default of 5pm if the response or work_hours format doesn't have the {dow:...}
        if (day !== "sun" && day !== "sat") {
            msUntilEndOfTheDay = getMillisUntilEndOfTheDay(d, HOUR_IN_MILLIS * 17);
        }
        const response = yield HttpClient_1.softwareGet("/users/profile", jwt);
        if (HttpClient_1.isResponseOk(response)) {
            // get the day of the week that matches today
            const work_hours_today = response.data.work_hours[day] || undefined;
            if (work_hours_today === null || work_hours_today === void 0 ? void 0 : work_hours_today.active) {
                // it's active, get the largest end range
                const endTimes = work_hours_today.ranges.map((n) => {
                    // convert "end" to total seconds in a day
                    return getEndTimeSeconds(n.end);
                });
                // sort milliseconds in descending order
                endTimes.sort(function (a, b) {
                    return b - a;
                });
                msUntilEndOfTheDay = getMillisUntilEndOfTheDay(d, endTimes[0]);
            }
        }
        if (msUntilEndOfTheDay > 0) {
            // set the timer to fire in "n" milliseconds
            timer = setTimeout(exports.showEndOfDayNotification, msUntilEndOfTheDay);
        }
    }
});
exports.showEndOfDayNotification = () => __awaiter(void 0, void 0, void 0, function* () {
    const tracker = TrackerManager_1.TrackerManager.getInstance();
    const selection = yield vscode_1.window.showInformationMessage("It's the end of your work day! Would you like to see your code time stats for today?", ...["Settings", "Show me the data"]);
    if (selection === "Show me the data") {
        let item = TreeButtonProvider_1.showMeTheDataKpmItem();
        tracker.trackUIInteraction(item);
        WebViewManager_1.showDashboard();
    }
    else if (selection === "Settings") {
        let item = TreeButtonProvider_1.configureSettingsKpmItem();
        tracker.trackUIInteraction(item);
        ConfigManager_1.configureSettings();
    }
});
function getEndTimeSeconds(end) {
    const hourMin = end.split(":");
    return parseInt(hourMin[0], 10) * HOUR_IN_MILLIS + parseInt(hourMin[1], 10) * MIN_IN_MILLIS;
}
function getMillisUntilEndOfTheDay(date, endMillis) {
    var startD = date_fns_1.startOfDay(date);
    var millisDiff = date_fns_1.differenceInMilliseconds(date, startD);
    return endMillis - millisDiff;
}
//# sourceMappingURL=endOfDay.js.map
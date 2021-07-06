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
exports.fetchMusicTimeMetricsDashboard = exports.fetchMusicTimeMetricsMarkdownDashboard = exports.isNewDay = exports.getSoftwareSessionAsJson = exports.logIt = exports.displayReadmeIfNotExists = exports.getLocalREADMEFile = exports.softwareSessionFileExists = exports.syncSpotifyIntegration = exports.syncSlackIntegrations = exports.getIntegrations = exports.setAuthCallbackState = exports.getAuthCallbackState = exports.getPluginUuid = exports.getItem = exports.setItem = exports.storeJsonData = exports.storeCurrentPayload = exports.getCurrentPayloadFile = exports.getFileDataAsJson = exports.getFile = exports.getFileChangeSummaryFile = exports.getSoftwareDir = exports.getExtensionName = exports.getExtensionDisplayName = exports.getMusicTimeMarkdownFile = exports.getMusicTimeFile = exports.getDailyReportSummaryFile = exports.getProjectCodeSummaryFile = exports.getSummaryInfoFile = exports.getCommitSummaryFile = exports.getDashboardFile = exports.getTimeCounterFile = exports.getPluginEventsFile = exports.getSoftwareDataStoreFile = exports.getIntegrationsFile = exports.getDeviceFile = exports.getSoftwareSessionFile = void 0;
const Util_1 = require("../Util");
const uuid_1 = require("uuid");
const vscode_1 = require("vscode");
const path = require("path");
const HttpClient_1 = require("../HttpClient");
const Constants_1 = require("../Constants");
const moment = require("moment-timezone");
const fileIt = require("file-it");
const fs = require("fs");
const os = require("os");
let lastDayOfMonth = -1;
const NO_DATA = `MUSIC TIME
    Listen to Spotify while coding to generate this playlist`;
function getSoftwareSessionFile() {
    return getFile("session.json");
}
exports.getSoftwareSessionFile = getSoftwareSessionFile;
function getDeviceFile() {
    return getFile("device.json");
}
exports.getDeviceFile = getDeviceFile;
function getIntegrationsFile() {
    return getFile("integrations.json");
}
exports.getIntegrationsFile = getIntegrationsFile;
function getSoftwareDataStoreFile() {
    return getFile("data.json");
}
exports.getSoftwareDataStoreFile = getSoftwareDataStoreFile;
function getPluginEventsFile() {
    return getFile("events.json");
}
exports.getPluginEventsFile = getPluginEventsFile;
function getTimeCounterFile() {
    return getFile("timeCounter.json");
}
exports.getTimeCounterFile = getTimeCounterFile;
function getDashboardFile() {
    return getFile("CodeTime.txt");
}
exports.getDashboardFile = getDashboardFile;
function getCommitSummaryFile() {
    return getFile("CommitSummary.txt");
}
exports.getCommitSummaryFile = getCommitSummaryFile;
function getSummaryInfoFile() {
    return getFile("SummaryInfo.txt");
}
exports.getSummaryInfoFile = getSummaryInfoFile;
function getProjectCodeSummaryFile() {
    return getFile("ProjectCodeSummary.txt");
}
exports.getProjectCodeSummaryFile = getProjectCodeSummaryFile;
function getDailyReportSummaryFile() {
    return getFile("DailyReportSummary.txt");
}
exports.getDailyReportSummaryFile = getDailyReportSummaryFile;
function getMusicTimeFile() {
    return getFile("MusicTime.txt");
}
exports.getMusicTimeFile = getMusicTimeFile;
function getMusicTimeMarkdownFile() {
    return getFile("MusicTime.html");
}
exports.getMusicTimeMarkdownFile = getMusicTimeMarkdownFile;
function getExtensionDisplayName() {
    return "Music Time";
}
exports.getExtensionDisplayName = getExtensionDisplayName;
function getExtensionName() {
    return "music-time";
}
exports.getExtensionName = getExtensionName;
function getSoftwareDir(autoCreate = true) {
    const homedir = os.homedir();
    const softwareDataDir = `${homedir}${getSeparator(Constants_1.SOFTWARE_FOLDER)}`;
    if (autoCreate && !fs.existsSync(softwareDataDir)) {
        fs.mkdirSync(softwareDataDir);
    }
    return softwareDataDir;
}
exports.getSoftwareDir = getSoftwareDir;
function getFileChangeSummaryFile() {
    return getFile("fileChangeSummary.json");
}
exports.getFileChangeSummaryFile = getFileChangeSummaryFile;
function getFile(name) {
    const file_path = `${getSoftwareDir()}${getSeparator(name)}`;
    return file_path;
}
exports.getFile = getFile;
function getSeparator(name) {
    if (Util_1.isWindows()) {
        return `\\${name}`;
    }
    return `/${name}`;
}
function getFileDataAsJson(file) {
    let data = fileIt.readJsonFileSync(file);
    return data;
}
exports.getFileDataAsJson = getFileDataAsJson;
function getCurrentPayloadFile() {
    return getFile("latestKeystrokes.json");
}
exports.getCurrentPayloadFile = getCurrentPayloadFile;
function storeCurrentPayload(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        storeJsonData(this.getCurrentPayloadFile(), payload);
    });
}
exports.storeCurrentPayload = storeCurrentPayload;
function storeJsonData(fileName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        fileIt.writeJsonFileSync(fileName, data);
    });
}
exports.storeJsonData = storeJsonData;
function setItem(key, value) {
    fileIt.setJsonValue(getSoftwareSessionFile(), key, value);
}
exports.setItem = setItem;
function getItem(key) {
    return fileIt.getJsonValue(getSoftwareSessionFile(), key);
}
exports.getItem = getItem;
function getPluginUuid() {
    let plugin_uuid = fileIt.getJsonValue(getDeviceFile(), "plugin_uuid");
    if (!plugin_uuid) {
        // set it for the 1st and only time
        plugin_uuid = uuid_1.v4();
        fileIt.setJsonValue(getDeviceFile(), "plugin_uuid", plugin_uuid);
    }
    return plugin_uuid;
}
exports.getPluginUuid = getPluginUuid;
function getAuthCallbackState(autoCreate = true) {
    let auth_callback_state = fileIt.getJsonValue(getDeviceFile(), "auth_callback_state");
    if (!auth_callback_state && autoCreate) {
        auth_callback_state = uuid_1.v4();
        fileIt.setJsonValue(getDeviceFile(), "auth_callback_state", auth_callback_state);
    }
    return auth_callback_state;
}
exports.getAuthCallbackState = getAuthCallbackState;
function setAuthCallbackState(value) {
    fileIt.setJsonValue(getDeviceFile(), "auth_callback_state", value);
}
exports.setAuthCallbackState = setAuthCallbackState;
function getIntegrations() {
    let integrations = getFileDataAsJson(getIntegrationsFile());
    if (!integrations) {
        integrations = [];
        fileIt.writeJsonFileSync(getIntegrationsFile(), integrations);
    }
    const integrationsLen = integrations.length;
    // check to see if there are any [] values and remove them
    integrations = integrations.filter((n) => n && n.authId);
    if (integrations.length !== integrationsLen) {
        // update the file with the latest
        fileIt.writeJsonFileSync(getIntegrationsFile(), integrations);
    }
    return integrations;
}
exports.getIntegrations = getIntegrations;
function syncSlackIntegrations(integrations) {
    const nonSlackIntegrations = getIntegrations().filter((integration) => integration.name.toLowerCase() != "slack");
    integrations = (integrations === null || integrations === void 0 ? void 0 : integrations.length) ? [...integrations, ...nonSlackIntegrations] : nonSlackIntegrations;
    fileIt.writeJsonFileSync(getIntegrationsFile(), integrations);
}
exports.syncSlackIntegrations = syncSlackIntegrations;
function syncSpotifyIntegration(integration) {
    const nonSpotifyIntegrations = getIntegrations().filter((integration) => integration.name.toLowerCase() != "spotify");
    const integrations = integration ? [...nonSpotifyIntegrations, integration] : nonSpotifyIntegrations;
    fileIt.writeJsonFileSync(getIntegrationsFile(), integrations);
}
exports.syncSpotifyIntegration = syncSpotifyIntegration;
function softwareSessionFileExists() {
    // don't auto create the file
    const file = getSoftwareSessionFile();
    // check if it exists
    return fs.existsSync(file);
}
exports.softwareSessionFileExists = softwareSessionFileExists;
function getLocalREADMEFile() {
    const resourcePath = path.join(__dirname, "resources");
    const file = path.join(resourcePath, "README.md");
    return file;
}
exports.getLocalREADMEFile = getLocalREADMEFile;
function displayReadmeIfNotExists(override = false) {
    const vscode_musictime_initialized = getItem("displayedMtReadme");
    if (!vscode_musictime_initialized) {
        // activate the plugin
        HttpClient_1.softwarePost("/plugins/activate", {}, getItem("jwt"));
    }
    if (!vscode_musictime_initialized || override) {
        setTimeout(() => {
            vscode_1.commands.executeCommand("musictime.displaySidebar");
        }, 1000);
        const readmeUri = vscode_1.Uri.file(getLocalREADMEFile());
        vscode_1.commands.executeCommand("markdown.showPreview", readmeUri, vscode_1.ViewColumn.One);
        setItem("displayedMtReadme", true);
    }
}
exports.displayReadmeIfNotExists = displayReadmeIfNotExists;
function logIt(message) {
    console.log(`${getExtensionName()}: ${message}`);
}
exports.logIt = logIt;
function getSoftwareSessionAsJson() {
    let data = fileIt.readJsonFileSync(getSoftwareSessionFile());
    return data ? data : {};
}
exports.getSoftwareSessionAsJson = getSoftwareSessionAsJson;
function isNewDay() {
    const { day } = Util_1.getNowTimes();
    const currentDay = getItem("currentDay");
    return currentDay !== day ? true : false;
}
exports.isNewDay = isNewDay;
function fetchMusicTimeMetricsMarkdownDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        let file = getMusicTimeMarkdownFile();
        const dayOfMonth = moment().startOf("day").date();
        if (!fs.existsSync(file) || lastDayOfMonth !== dayOfMonth) {
            lastDayOfMonth = dayOfMonth;
            yield fetchDashboardData(file, true);
        }
    });
}
exports.fetchMusicTimeMetricsMarkdownDashboard = fetchMusicTimeMetricsMarkdownDashboard;
function fetchMusicTimeMetricsDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        let file = getMusicTimeFile();
        const dayOfMonth = moment().startOf("day").date();
        if (fs.existsSync(file) || lastDayOfMonth !== dayOfMonth) {
            lastDayOfMonth = dayOfMonth;
            yield fetchDashboardData(file, false);
        }
    });
}
exports.fetchMusicTimeMetricsDashboard = fetchMusicTimeMetricsDashboard;
function fetchDashboardData(fileName, isHtml) {
    return __awaiter(this, void 0, void 0, function* () {
        const musicSummary = yield HttpClient_1.softwareGet(`/dashboard/music?linux=${Util_1.isLinux()}&html=${isHtml}`, getItem("jwt"));
        // get the content
        let content = musicSummary && musicSummary.data ? musicSummary.data : NO_DATA;
        fileIt.writeContentFileSync(fileName, content);
    });
}
//# sourceMappingURL=FileManager.js.map
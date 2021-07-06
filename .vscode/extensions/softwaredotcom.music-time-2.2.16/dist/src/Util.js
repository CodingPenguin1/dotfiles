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
exports.getFileDataArray = exports.getCodyErrorMessage = exports.createSpotifyIdFromUri = exports.createUriFromPlaylistId = exports.createUriFromTrackId = exports.showWarningMessage = exports.showInformationMessage = exports.humanizeMinutes = exports.showModalSignupPrompt = exports.checkRegistration = exports.launchMusicAnalytics = exports.launchWebUrl = exports.getGitEmail = exports.getSongDisplayName = exports.normalizeGithubEmail = exports.formatPathIfNecessary = exports.deleteFile = exports.randomCode = exports.coalesceNumber = exports.getFormattedDay = exports.getNowTimes = exports.getOffsetSeconds = exports.nowInSecs = exports.showOfflinePrompt = exports.getOsUsername = exports.getOs = exports.getHostname = exports.isMac = exports.isWindows = exports.isLinux = exports.getProjectFolder = exports.getRootPathForFile = exports.getNumberOfTextDocumentsOpen = exports.getRootPaths = exports.getFirstWorkspaceFolder = exports.findFirstActiveDirectoryOrWorkspaceDirectory = exports.getActiveProjectWorkspace = exports.getWorkspaceFolders = exports.musicTimeExtInstalled = exports.isCodeTimeTimeInstalled = exports.isCodeTimeMetricsFile = exports.getVersion = exports.getPluginType = exports.getPluginName = exports.getPluginId = exports.MARKER_WIDTH = exports.DASHBOARD_VALUE_WIDTH = exports.DASHBOARD_LABEL_WIDTH = exports.alpha = void 0;
const vscode_1 = require("vscode");
const Constants_1 = require("./Constants");
const cody_music_1 = require("cody-music");
const FileManager_1 = require("./managers/FileManager");
const GitUtil_1 = require("./repo/GitUtil");
const ExecManager_1 = require("./managers/ExecManager");
const fileIt = require("file-it");
const moment = require("moment-timezone");
const open = require("open");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
exports.alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
exports.DASHBOARD_LABEL_WIDTH = 25;
exports.DASHBOARD_VALUE_WIDTH = 25;
exports.MARKER_WIDTH = 4;
const NUMBER_IN_EMAIL_REGEX = new RegExp("^\\d+\\+");
const dayFormat = "YYYY-MM-DD";
const dayTimeFormat = "LLLL";
function getPluginId() {
    return Constants_1.MUSIC_TIME_PLUGIN_ID;
}
exports.getPluginId = getPluginId;
function getPluginName() {
    return Constants_1.MUSIC_TIME_EXT_ID;
}
exports.getPluginName = getPluginName;
function getPluginType() {
    return Constants_1.MUSIC_TIME_TYPE;
}
exports.getPluginType = getPluginType;
function getVersion() {
    const extension = vscode_1.extensions.getExtension(Constants_1.MUSIC_TIME_EXT_ID);
    return extension.packageJSON.version;
}
exports.getVersion = getVersion;
function isCodeTimeMetricsFile(fileName) {
    fileName = fileName || "";
    if (fileName.includes(Constants_1.SOFTWARE_FOLDER) && fileName.includes("CodeTime")) {
        return true;
    }
    return false;
}
exports.isCodeTimeMetricsFile = isCodeTimeMetricsFile;
function isCodeTimeTimeInstalled() {
    const codeTimeExt = vscode_1.extensions.getExtension(Constants_1.CODE_TIME_EXT_ID);
    return !!codeTimeExt;
}
exports.isCodeTimeTimeInstalled = isCodeTimeTimeInstalled;
function musicTimeExtInstalled() {
    const musicTimeExt = vscode_1.extensions.getExtension(Constants_1.MUSIC_TIME_EXT_ID);
    return musicTimeExt ? true : false;
}
exports.musicTimeExtInstalled = musicTimeExtInstalled;
/**
 * These will return the workspace folders.
 * use the uri.fsPath to get the full path
 * use the name to get the folder name
 */
function getWorkspaceFolders() {
    let folders = [];
    if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0) {
        for (let i = 0; i < vscode_1.workspace.workspaceFolders.length; i++) {
            let workspaceFolder = vscode_1.workspace.workspaceFolders[i];
            let folderUri = workspaceFolder.uri;
            if (folderUri && folderUri.fsPath) {
                folders.push(workspaceFolder);
            }
        }
    }
    return folders;
}
exports.getWorkspaceFolders = getWorkspaceFolders;
function getActiveProjectWorkspace() {
    const activeDocPath = findFirstActiveDirectoryOrWorkspaceDirectory();
    if (activeDocPath) {
        if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0) {
            for (let i = 0; i < vscode_1.workspace.workspaceFolders.length; i++) {
                const workspaceFolder = vscode_1.workspace.workspaceFolders[i];
                const folderPath = workspaceFolder.uri.fsPath;
                if (activeDocPath.indexOf(folderPath) !== -1) {
                    return workspaceFolder;
                }
            }
        }
    }
    return null;
}
exports.getActiveProjectWorkspace = getActiveProjectWorkspace;
function findFirstActiveDirectoryOrWorkspaceDirectory() {
    if (getNumberOfTextDocumentsOpen() > 0) {
        // check if the .software/CodeTime has already been opened
        for (let i = 0; i < vscode_1.workspace.textDocuments.length; i++) {
            let docObj = vscode_1.workspace.textDocuments[i];
            if (docObj.fileName) {
                const dir = getRootPathForFile(docObj.fileName);
                if (dir) {
                    return dir;
                }
            }
        }
    }
    const folder = getFirstWorkspaceFolder();
    if (folder) {
        return folder.uri.fsPath;
    }
    return "";
}
exports.findFirstActiveDirectoryOrWorkspaceDirectory = findFirstActiveDirectoryOrWorkspaceDirectory;
function getFirstWorkspaceFolder() {
    const workspaceFolders = getWorkspaceFolders();
    if (workspaceFolders && workspaceFolders.length) {
        return workspaceFolders[0];
    }
    return null;
}
exports.getFirstWorkspaceFolder = getFirstWorkspaceFolder;
function getRootPaths() {
    let paths = [];
    if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0) {
        for (let i = 0; i < vscode_1.workspace.workspaceFolders.length; i++) {
            let workspaceFolder = vscode_1.workspace.workspaceFolders[i];
            let folderUri = workspaceFolder.uri;
            if (folderUri && folderUri.fsPath) {
                paths.push(folderUri.fsPath);
            }
        }
    }
    return paths;
}
exports.getRootPaths = getRootPaths;
function getNumberOfTextDocumentsOpen() {
    return vscode_1.workspace.textDocuments ? vscode_1.workspace.textDocuments.length : 0;
}
exports.getNumberOfTextDocumentsOpen = getNumberOfTextDocumentsOpen;
function getRootPathForFile(fileName) {
    let folder = getProjectFolder(fileName);
    if (folder) {
        return folder.uri.fsPath;
    }
    return null;
}
exports.getRootPathForFile = getRootPathForFile;
function getProjectFolder(fileName) {
    let liveshareFolder = null;
    if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0) {
        for (let i = 0; i < vscode_1.workspace.workspaceFolders.length; i++) {
            let workspaceFolder = vscode_1.workspace.workspaceFolders[i];
            if (workspaceFolder.uri) {
                let isVslsScheme = workspaceFolder.uri.scheme === "vsls" ? true : false;
                if (isVslsScheme) {
                    liveshareFolder = workspaceFolder;
                }
                let folderUri = workspaceFolder.uri;
                if (folderUri && folderUri.fsPath && !isVslsScheme && fileName.includes(folderUri.fsPath)) {
                    return workspaceFolder;
                }
            }
        }
    }
    // wasn't found but if liveshareFolder was found, return that
    if (liveshareFolder) {
        return liveshareFolder;
    }
    return null;
}
exports.getProjectFolder = getProjectFolder;
function isLinux() {
    return isWindows() || isMac() ? false : true;
}
exports.isLinux = isLinux;
// process.platform return the following...
//   -> 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
function isWindows() {
    return process.platform.indexOf("win32") !== -1;
}
exports.isWindows = isWindows;
function isMac() {
    return process.platform.indexOf("darwin") !== -1;
}
exports.isMac = isMac;
function getHostname() {
    return __awaiter(this, void 0, void 0, function* () {
        let hostname = ExecManager_1.execCmd("hostname");
        return hostname;
    });
}
exports.getHostname = getHostname;
function getOs() {
    let parts = [];
    let osType = os.type();
    if (osType) {
        parts.push(osType);
    }
    let osRelease = os.release();
    if (osRelease) {
        parts.push(osRelease);
    }
    let platform = os.platform();
    if (platform) {
        parts.push(platform);
    }
    if (parts.length > 0) {
        return parts.join("_");
    }
    return "";
}
exports.getOs = getOs;
function getOsUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        let username = os.userInfo().username;
        if (!username || username.trim() === "") {
            username = ExecManager_1.execCmd("whoami");
        }
        return username;
    });
}
exports.getOsUsername = getOsUsername;
function showOfflinePrompt(addReconnectMsg = false) {
    return __awaiter(this, void 0, void 0, function* () {
        // shows a prompt that we're not able to communicate with the app server
        let infoMsg = "Our service is temporarily unavailable. ";
        if (addReconnectMsg) {
            infoMsg += "We will try to reconnect again in 10 minutes. Your status bar will not update at this time.";
        }
        else {
            infoMsg += "Please try again later.";
        }
        // set the last update time so we don't try to ask too frequently
        vscode_1.window.showInformationMessage(infoMsg, ...["OK"]);
    });
}
exports.showOfflinePrompt = showOfflinePrompt;
function nowInSecs() {
    return Math.round(Date.now() / 1000);
}
exports.nowInSecs = nowInSecs;
function getOffsetSeconds() {
    let d = new Date();
    return d.getTimezoneOffset() * 60;
}
exports.getOffsetSeconds = getOffsetSeconds;
function getNowTimes() {
    const now = moment.utc();
    const now_in_sec = now.unix();
    const offset_in_sec = moment().utcOffset() * 60;
    const local_now_in_sec = now_in_sec + offset_in_sec;
    const utcDay = now.format(dayFormat);
    const day = moment().format(dayFormat);
    const localDayTime = moment().format(dayTimeFormat);
    return {
        now,
        now_in_sec,
        offset_in_sec,
        local_now_in_sec,
        utcDay,
        day,
        localDayTime,
    };
}
exports.getNowTimes = getNowTimes;
function getFormattedDay(unixSeconds) {
    return moment.unix(unixSeconds).format(dayFormat);
}
exports.getFormattedDay = getFormattedDay;
function coalesceNumber(val, defaultVal = 0) {
    if (val === null || val === undefined || isNaN(val)) {
        return defaultVal;
    }
    return val;
}
exports.coalesceNumber = coalesceNumber;
function randomCode() {
    return crypto
        .randomBytes(16)
        .map((value) => exports.alpha.charCodeAt(Math.floor((value * exports.alpha.length) / 256)))
        .toString();
}
exports.randomCode = randomCode;
function deleteFile(file) {
    // if the file exists, get it
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }
}
exports.deleteFile = deleteFile;
/**
 * Format pathString if it is on Windows. Convert `c:\` like string to `C:\`
 * @param pathString
 */
function formatPathIfNecessary(pathString) {
    if (process.platform === "win32") {
        pathString = pathString.replace(/^([a-zA-Z])\:\\/, (_, $1) => `${$1.toUpperCase()}:\\`);
    }
    return pathString;
}
exports.formatPathIfNecessary = formatPathIfNecessary;
function normalizeGithubEmail(email, filterOutNonEmails = true) {
    if (email) {
        if (filterOutNonEmails && (email.endsWith("github.com") || email.includes("users.noreply"))) {
            return null;
        }
        else {
            const found = email.match(NUMBER_IN_EMAIL_REGEX);
            if (found && email.includes("users.noreply")) {
                // filter out the ones that look like
                // 2342353345+username@users.noreply.github.com"
                return null;
            }
        }
    }
    return email;
}
exports.normalizeGithubEmail = normalizeGithubEmail;
function getSongDisplayName(name) {
    if (!name) {
        return "";
    }
    let displayName = "";
    name = name.trim();
    if (name.length > 14) {
        const parts = name.split(" ");
        for (let i = 0; i < parts.length; i++) {
            displayName = `${displayName} ${parts[i]}`;
            if (displayName.length >= 12) {
                if (displayName.length > 14) {
                    // trim it down to at least 14
                    displayName = `${displayName.substring(0, 14)}`;
                }
                displayName = `${displayName}..`;
                break;
            }
        }
    }
    else {
        displayName = name;
    }
    return displayName.trim();
}
exports.getSongDisplayName = getSongDisplayName;
function getGitEmail() {
    return __awaiter(this, void 0, void 0, function* () {
        let projectDirs = getRootPaths();
        if (!projectDirs || projectDirs.length === 0) {
            return null;
        }
        for (let i = 0; i < projectDirs.length; i++) {
            let projectDir = projectDirs[i];
            if (projectDir && GitUtil_1.isGitProject(projectDir)) {
                let email = ExecManager_1.execCmd("git config user.email", projectDir);
                if (email) {
                    /**
                     * // normalize the email, possible github email types
                     * shupac@users.noreply.github.com
                     * 37358488+rick-software@users.noreply.github.com
                     */
                    email = normalizeGithubEmail(email);
                    return email;
                }
            }
        }
        return null;
    });
}
exports.getGitEmail = getGitEmail;
function launchWebUrl(url) {
    open(url);
}
exports.launchWebUrl = launchWebUrl;
function launchMusicAnalytics() {
    const isRegistered = checkRegistration();
    if (!isRegistered) {
        return;
    }
    open(`${Constants_1.launch_url}/music`);
}
exports.launchMusicAnalytics = launchMusicAnalytics;
function checkRegistration(showSignup = true) {
    if (!FileManager_1.getItem("name")) {
        if (showSignup) {
            showModalSignupPrompt("Sign up or register for a web.com account at Software.com to view your most productive music.");
        }
        return false;
    }
    return true;
}
exports.checkRegistration = checkRegistration;
function showModalSignupPrompt(msg) {
    vscode_1.window
        .showInformationMessage(msg, {
        modal: true,
    }, "Sign up")
        .then((selection) => __awaiter(this, void 0, void 0, function* () {
        if (selection === "Sign up") {
            vscode_1.commands.executeCommand("musictime.signUpAccount");
        }
    }));
}
exports.showModalSignupPrompt = showModalSignupPrompt;
/**
 * humanize the minutes
 */
function humanizeMinutes(min) {
    min = parseInt(min, 0) || 0;
    let str = "";
    if (min === 60) {
        str = "1 hr";
    }
    else if (min > 60) {
        let hrs = parseFloat(min) / 60;
        if (hrs % 1 === 0) {
            str = hrs.toFixed(0) + " hrs";
        }
        else {
            str = (Math.round(hrs * 10) / 10).toFixed(1) + " hrs";
        }
    }
    else if (min === 1) {
        str = "1 min";
    }
    else {
        // less than 60 seconds
        str = min.toFixed(0) + " min";
    }
    return str;
}
exports.humanizeMinutes = humanizeMinutes;
function showInformationMessage(message) {
    return vscode_1.window.showInformationMessage(`${message}`);
}
exports.showInformationMessage = showInformationMessage;
function showWarningMessage(message) {
    return vscode_1.window.showWarningMessage(`${message}`);
}
exports.showWarningMessage = showWarningMessage;
function createUriFromTrackId(track_id) {
    if (track_id && !track_id.includes("spotify:track:")) {
        track_id = `spotify:track:${track_id}`;
    }
    return track_id;
}
exports.createUriFromTrackId = createUriFromTrackId;
function createUriFromPlaylistId(playlist_id) {
    if (playlist_id && !playlist_id.includes("spotify:playlist:")) {
        playlist_id = `spotify:playlist:${playlist_id}`;
    }
    return playlist_id;
}
exports.createUriFromPlaylistId = createUriFromPlaylistId;
function createSpotifyIdFromUri(id) {
    if (id && id.indexOf("spotify:") === 0) {
        return id.substring(id.lastIndexOf(":") + 1);
    }
    return id;
}
exports.createSpotifyIdFromUri = createSpotifyIdFromUri;
function getCodyErrorMessage(response) {
    if (response && response.error && response.error.response) {
        return response.error.response.data.error.message;
    }
    else if (response.state === cody_music_1.CodyResponseType.Failed) {
        return response.message;
    }
    return "";
}
exports.getCodyErrorMessage = getCodyErrorMessage;
function getFileDataArray(file) {
    let payloads = fileIt.readJsonArraySync(file);
    return payloads;
}
exports.getFileDataArray = getFileDataArray;
//# sourceMappingURL=Util.js.map
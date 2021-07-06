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
exports.migrateAccessInfo = exports.updateCodyConfig = exports.disconnectSpotify = exports.removeSpotifyIntegration = exports.getSpotifyIntegration = exports.switchSpotifyAccount = exports.populateSpotifyUser = exports.lazilyPollForSpotifyConnection = exports.connectSpotify = exports.updateSpotifyClientInfo = exports.isPremiumUser = exports.getSoftwareTop40 = exports.getSpotifyEmail = exports.hasSpotifyUser = exports.getConnectedSpotifyUser = exports.updateAddedNewIntegration = void 0;
const cody_music_1 = require("cody-music");
const vscode_1 = require("vscode");
const Constants_1 = require("../Constants");
const HttpClient_1 = require("../HttpClient");
const Util_1 = require("../Util");
const MusicCommandManager_1 = require("../music/MusicCommandManager");
const FileManager_1 = require("./FileManager");
const UserStatusManager_1 = require("./UserStatusManager");
const IntegrationManager_1 = require("./IntegrationManager");
const UserStatusManager_2 = require("./UserStatusManager");
const PlaylistDataManager_1 = require("./PlaylistDataManager");
const queryString = require("query-string");
let spotifyUser = null;
let spotifyClientId = "";
let spotifyClientSecret = "";
let addedNewIntegration = false;
function updateAddedNewIntegration(val) {
    addedNewIntegration = val;
}
exports.updateAddedNewIntegration = updateAddedNewIntegration;
function getConnectedSpotifyUser() {
    return spotifyUser;
}
exports.getConnectedSpotifyUser = getConnectedSpotifyUser;
function hasSpotifyUser() {
    return !!(spotifyUser && spotifyUser.product);
}
exports.hasSpotifyUser = hasSpotifyUser;
function getSpotifyEmail() {
    const spotifyIntegration = getSpotifyIntegration();
    return spotifyIntegration === null || spotifyIntegration === void 0 ? void 0 : spotifyIntegration.value;
}
exports.getSpotifyEmail = getSpotifyEmail;
function getSoftwareTop40() {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield HttpClient_1.softwareGet("/music/top40");
        return HttpClient_1.isResponseOk(data) ? data.data : null;
    });
}
exports.getSoftwareTop40 = getSoftwareTop40;
function isPremiumUser() {
    return __awaiter(this, void 0, void 0, function* () {
        if (spotifyUser && spotifyUser.product !== "premium") {
            // check 1 more time
            yield populateSpotifyUser(true);
        }
        return !!(spotifyUser && spotifyUser.product === "premium");
    });
}
exports.isPremiumUser = isPremiumUser;
function updateSpotifyClientInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield HttpClient_1.softwareGet("/auth/spotify/clientInfo", FileManager_1.getItem("jwt"));
        if (HttpClient_1.isResponseOk(resp)) {
            // get the clientId and clientSecret
            spotifyClientId = resp.data.clientId;
            spotifyClientSecret = resp.data.clientSecret;
        }
    });
}
exports.updateSpotifyClientInfo = updateSpotifyClientInfo;
function connectSpotify() {
    return __awaiter(this, void 0, void 0, function* () {
        // check if they're already connected, if so then ask if they would
        // like to continue as we'll need to disconnect the current connection
        const spotifyIntegration = getSpotifyIntegration();
        if (spotifyIntegration) {
            // disconnectSpotify
            const selection = yield vscode_1.window.showInformationMessage(`Connect with a different Spotify account?`, ...[Constants_1.YES_LABEL]);
            if (!selection || selection !== Constants_1.YES_LABEL) {
                return;
            }
            // disconnect the current connection
            yield disconnectSpotify(false /*confirmDisconnect*/);
        }
        const auth_callback_state = FileManager_1.getAuthCallbackState();
        let queryStr = queryString.stringify({
            plugin: Util_1.getPluginType(),
            plugin_uuid: FileManager_1.getPluginUuid(),
            pluginVersion: Util_1.getVersion(),
            plugin_id: Util_1.getPluginId(),
            mac: Util_1.isMac(),
            auth_callback_state,
            plugin_token: FileManager_1.getItem("jwt"),
        });
        const endpoint = `${Constants_1.api_endpoint}/auth/spotify?${queryStr}`;
        Util_1.launchWebUrl(endpoint);
        addedNewIntegration = false;
        setTimeout(() => {
            lazilyPollForSpotifyConnection();
        }, 15000);
    });
}
exports.connectSpotify = connectSpotify;
function lazilyPollForSpotifyConnection(tries = 20) {
    return __awaiter(this, void 0, void 0, function* () {
        addedNewIntegration = !addedNewIntegration ? yield IntegrationManager_1.updateSpotifyIntegration(yield UserStatusManager_1.getUser(FileManager_1.getItem("jwt"))) : addedNewIntegration;
        if (!addedNewIntegration) {
            // try again
            tries--;
            setTimeout(() => {
                lazilyPollForSpotifyConnection(tries);
            }, 15000);
        }
        else {
            // reload the playlists
            UserStatusManager_2.processNewSpotifyIntegration();
        }
    });
}
exports.lazilyPollForSpotifyConnection = lazilyPollForSpotifyConnection;
function populateSpotifyUser(hardRefresh = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const spotifyIntegration = getSpotifyIntegration();
        if (spotifyIntegration && (hardRefresh || !spotifyUser || !spotifyUser.id)) {
            // get the user
            spotifyUser = yield cody_music_1.getUserProfile();
        }
    });
}
exports.populateSpotifyUser = populateSpotifyUser;
function switchSpotifyAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        const selection = yield vscode_1.window.showInformationMessage(`Are you sure you would like to connect to a different Spotify account?`, ...[Constants_1.YES_LABEL]);
        if (selection === Constants_1.YES_LABEL) {
            yield disconnectSpotify(false);
            connectSpotify();
        }
    });
}
exports.switchSpotifyAccount = switchSpotifyAccount;
function getSpotifyIntegration() {
    const spotifyIntegrations = FileManager_1.getIntegrations().filter((n) => n.name.toLowerCase() === "spotify" && n.status.toLowerCase() === "active");
    if (spotifyIntegrations === null || spotifyIntegrations === void 0 ? void 0 : spotifyIntegrations.length) {
        // get the last one in case we have more than one.
        // the last one is the the latest one created.
        return spotifyIntegrations[spotifyIntegrations.length - 1];
    }
    return null;
}
exports.getSpotifyIntegration = getSpotifyIntegration;
function removeSpotifyIntegration() {
    IntegrationManager_1.clearSpotifyIntegrations();
    // clear the tokens from cody config
    updateCodyConfig();
    // update the spotify user to null
    spotifyUser = null;
}
exports.removeSpotifyIntegration = removeSpotifyIntegration;
function disconnectSpotify(confirmDisconnect = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const selection = confirmDisconnect
            ? yield vscode_1.window.showInformationMessage(`Are you sure you would like to disconnect Spotify?`, ...[Constants_1.YES_LABEL])
            : Constants_1.YES_LABEL;
        if (selection === Constants_1.YES_LABEL) {
            yield HttpClient_1.softwarePut(`/auth/spotify/disconnect`, {}, FileManager_1.getItem("jwt"));
            // remove the integration
            removeSpotifyIntegration();
            // clear the spotify playlists
            PlaylistDataManager_1.clearAllData();
            setTimeout(() => {
                vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
            }, 1000);
            // update the status bar
            MusicCommandManager_1.MusicCommandManager.syncControls(yield cody_music_1.getRunningTrack(), false);
            if (confirmDisconnect) {
                vscode_1.window.showInformationMessage(`Successfully disconnected your Spotify connection.`);
            }
        }
    });
}
exports.disconnectSpotify = disconnectSpotify;
/**
 * Update the cody config settings for cody-music
 */
function updateCodyConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const spotifyIntegration = getSpotifyIntegration();
        if (!spotifyIntegration) {
            spotifyUser = null;
        }
        const codyConfig = new cody_music_1.CodyConfig();
        codyConfig.enableItunesDesktop = false;
        codyConfig.enableItunesDesktopSongTracking = Util_1.isMac();
        codyConfig.enableSpotifyDesktop = Util_1.isMac();
        codyConfig.spotifyClientId = spotifyClientId;
        codyConfig.spotifyAccessToken = spotifyIntegration ? spotifyIntegration.access_token : null;
        codyConfig.spotifyRefreshToken = spotifyIntegration ? spotifyIntegration.refresh_token : null;
        codyConfig.spotifyClientSecret = spotifyClientSecret;
        cody_music_1.setConfig(codyConfig);
    });
}
exports.updateCodyConfig = updateCodyConfig;
function migrateAccessInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!getSpotifyIntegration()) {
            const legacyAccessToken = FileManager_1.getItem("spotify_access_token");
            if (legacyAccessToken) {
                // get the user
                const user = yield UserStatusManager_1.getUser(FileManager_1.getItem("jwt"));
                if (user) {
                    // update the integrations
                    yield IntegrationManager_1.updateSpotifyIntegration(user);
                    updateCodyConfig();
                }
            }
            // remove the legacy spotify_access_token to so we don't have to check
            // if the user needs to migrate any longer
            FileManager_1.setItem("spotify_access_token", null);
        }
    });
}
exports.migrateAccessInfo = migrateAccessInfo;
//# sourceMappingURL=SpotifyManager.js.map
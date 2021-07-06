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
exports.ProviderItemManager = void 0;
const cody_music_1 = require("cody-music");
const view_constants_1 = require("../app/utils/view_constants");
const Util_1 = require("../Util");
const models_1 = require("../model/models");
const SlackManager_1 = require("../managers/SlackManager");
const FileManager_1 = require("../managers/FileManager");
const PlaylistDataManager_1 = require("../managers/PlaylistDataManager");
class ProviderItemManager {
    constructor() {
        //
    }
    static getInstance() {
        if (!ProviderItemManager.instance) {
            ProviderItemManager.instance = new ProviderItemManager();
        }
        return ProviderItemManager.instance;
    }
    getSpotifyLikedPlaylistFolder() {
        const item = new cody_music_1.PlaylistItem();
        item.type = "playlist";
        item.id = view_constants_1.SPOTIFY_LIKED_SONGS_PLAYLIST_NAME;
        item.tracks = new cody_music_1.PlaylistTrackInfo();
        // set set a number so it shows up
        item.tracks.total = 1;
        item.playerType = cody_music_1.PlayerType.WebSpotify;
        item.tag = "spotify-liked-songs";
        item.itemType = "playlist";
        item.name = view_constants_1.SPOTIFY_LIKED_SONGS_PLAYLIST_NAME;
        return item;
    }
    getActiveSpotifyDevicesButton() {
        return __awaiter(this, void 0, void 0, function* () {
            const { webPlayer, desktop, activeDevice, activeComputerDevice, activeWebPlayerDevice } = PlaylistDataManager_1.getDeviceSet();
            const devices = PlaylistDataManager_1.getCurrentDevices();
            let msg = "";
            let tooltip = "Listening on a Spotify device";
            if (activeDevice) {
                // found an active device
                msg = `Listening on ${activeDevice.name}`;
            }
            else if (Util_1.isMac() && desktop) {
                // show that the desktop player is an active device
                msg = `Listening on ${desktop.name}`;
            }
            else if (webPlayer) {
                // show that the web player is an active device
                msg = `Listening on ${webPlayer.name}`;
            }
            else if (desktop) {
                // show that the desktop player is an active device
                msg = `Listening on ${desktop.name}`;
            }
            else if (devices.length) {
                // no active device but found devices
                const names = devices.map((d) => d.name);
                msg = `Spotify devices available`;
                tooltip = `Multiple devices available: ${names.join(", ")}`;
            }
            else if (devices.length === 0) {
                // no active device and no devices
                msg = "Connect to a Spotify device";
                tooltip = "Click to launch the web or desktop player";
            }
            return this.createSpotifyDevicesButton(msg, tooltip, true, "musictime.deviceSelector");
        });
    }
    getSpotifyPremiumAccountRequiredButton() {
        return this.buildActionItem("spotifypremium", "action", "musictime.switchSpotifyAccount", cody_music_1.PlayerType.NotAssigned, "Switch Account", "Connect to your premium Spotify account to enable web playback controls", null, null);
    }
    getLoadingButton() {
        return this.buildActionItem("loading", "action", null, cody_music_1.PlayerType.NotAssigned, "Loading...", "please wait", null, "action");
    }
    getConnectToSpotifyButton() {
        const requiresReAuth = PlaylistDataManager_1.requiresSpotifyReAuthentication();
        const action = requiresReAuth ? "Reconnect" : "Connect";
        return this.buildActionItem("connecttospotify", "spotify", "musictime.connectSpotify", cody_music_1.PlayerType.WebSpotify, `${action} Spotify`, "Connect Spotify to view your playlists");
    }
    getRecommendationConnectToSpotifyButton() {
        // Connect Spotify to see recommendations
        const requiresReAuth = PlaylistDataManager_1.requiresSpotifyReAuthentication();
        const action = requiresReAuth ? "Reconnect" : "Connect";
        return this.buildActionItem("recommendconnecttospotify", "spotify", "musictime.connectSpotify", cody_music_1.PlayerType.WebSpotify, `${action} Spotify to see recommendations`, "Connect Spotify to see your playlist and track recommendations");
    }
    getSwitchToSpotifyButton() {
        return this.buildActionItem("switchtospotify", "spotify", "musictime.launchSpotifyDesktop", cody_music_1.PlayerType.WebSpotify, "Launch Spotify");
    }
    getAuthTypeIconAndLabel() {
        const authType = FileManager_1.getItem("authType");
        const name = FileManager_1.getItem("name");
        let tooltip = name ? `Connected as ${name}` : "";
        if (authType === "google") {
            return {
                label: name,
                tooltip,
            };
        }
        else if (authType === "github") {
            return {
                label: name,
                tooltip,
            };
        }
        return {
            label: name,
            tooltip,
        };
    }
    getSignupButton() {
        return this.buildActionItem("signupbutton", "action", "musictime.signUpAccount", null, "Sign up", "Sign up to see more data visualizations.", "", null);
    }
    getLoginButton() {
        return this.buildActionItem("loginbutton", "action", "musictime.logInAccount", null, "Log in", "Log in to see more data visualizations.", "", null);
    }
    getGenerateDashboardButton() {
        return this.buildKpmItem("Dashboard", "View your latest music metrics right here in your editor", null, "musictime.displayDashboard");
    }
    getSlackIntegrationsTree() {
        const parentItem = this.buildKpmItem("Slack workspaces", "");
        parentItem.contextValue = "musictime_slack_folder_parent";
        parentItem.children = [];
        const workspaces = SlackManager_1.getSlackWorkspaces();
        for (const integration of workspaces) {
            const workspaceItem = this.buildKpmItem(integration.team_domain, "");
            workspaceItem.contextValue = "musictime_slack_workspace_node";
            workspaceItem.description = `(${integration.team_name})`;
            workspaceItem.value = integration.authId;
            parentItem.children.push(workspaceItem);
        }
        return parentItem;
    }
    createSpotifyDevicesButton(title, tooltip, loggedIn, command = null) {
        const button = this.buildActionItem("devicesbutton", "spotify", command, cody_music_1.PlayerType.WebSpotify, title, tooltip);
        button.tag = loggedIn ? "active" : "disabled";
        return button;
    }
    getLineBreakButton() {
        return this.buildActionItem("linebreak", "divider", null, cody_music_1.PlayerType.NotAssigned, "", "");
    }
    buildActionItem(id, type, command, playerType, name, tooltip = "", itemType = "", callback = null, icon = "") {
        let item = new cody_music_1.PlaylistItem();
        item.tracks = new cody_music_1.PlaylistTrackInfo();
        item.type = type;
        item.id = id;
        item.command = command;
        item["cb"] = callback;
        item.playerType = playerType;
        item.name = name;
        item.tooltip = tooltip;
        item.itemType = itemType;
        item["icon"] = icon;
        return item;
    }
    buildKpmItem(label, tooltip = "", icon = null, command = null) {
        const item = new models_1.KpmItem();
        item.name = label;
        item.tooltip = tooltip;
        item.icon = icon;
        item.command = command;
        item.id = `${label}_kpm_item`;
        item.eventDescription = null;
        item.type = "kpm_type";
        return item;
    }
    getWebAnalyticsButton() {
        // See web analytics
        return this.buildKpmItem("More data at Software.com", "See music analytics in the web app", null, "musictime.launchAnalytics");
    }
    getNoTracksFoundButton() {
        return this.buildActionItem("notracksfoundbutton", "message", null, cody_music_1.PlayerType.NotAssigned, "Your tracks will appear here");
    }
    getSwitchToThisDeviceButton() {
        return __awaiter(this, void 0, void 0, function* () {
            const { webPlayer, desktop, activeDevice, activeComputerDevice, activeWebPlayerDevice } = PlaylistDataManager_1.getDeviceSet();
            if (activeDevice && !webPlayer && !desktop) {
                // return a button to switch to this computer if we have devices
                // and none of them are of type "Computer"
                const button = this.buildActionItem("switchtothisdevicebutton", "action", "musictime.switchToThisDevice", cody_music_1.PlayerType.MacSpotifyDesktop, "Switch To This Device");
                return button;
            }
            return null;
        });
    }
    getInactiveDevices(devices) {
        return __awaiter(this, void 0, void 0, function* () {
            let inactive_devices = [];
            if (devices && devices.length > 0) {
                for (let i = 0; i < devices.length; i++) {
                    const device = devices[i];
                    if (!device.is_active) {
                        inactive_devices.push(device);
                    }
                }
            }
            return inactive_devices;
        });
    }
}
exports.ProviderItemManager = ProviderItemManager;
//# sourceMappingURL=ProviderItemManager.js.map
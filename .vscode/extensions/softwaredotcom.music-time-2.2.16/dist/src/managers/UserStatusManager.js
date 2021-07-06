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
exports.processNewSpotifyIntegration = exports.authenticationCompleteHandler = exports.launchLogin = exports.showSignUpMenuOptions = exports.showLogInMenuOptions = exports.getUser = void 0;
const vscode_1 = require("vscode");
const Constants_1 = require("../Constants");
const HttpClient_1 = require("../HttpClient");
const MenuManager_1 = require("../MenuManager");
const Util_1 = require("../Util");
const websockets_1 = require("../websockets");
const FileManager_1 = require("./FileManager");
const IntegrationManager_1 = require("./IntegrationManager");
const PlaylistDataManager_1 = require("./PlaylistDataManager");
const queryString = require("query-string");
function getUser(jwt) {
    return __awaiter(this, void 0, void 0, function* () {
        if (jwt) {
            let api = `/users/me`;
            let resp = yield HttpClient_1.softwareGet(api, jwt);
            if (HttpClient_1.isResponseOk(resp)) {
                if (resp && resp.data && resp.data.data) {
                    const user = resp.data.data;
                    return user;
                }
            }
        }
        return null;
    });
}
exports.getUser = getUser;
function showLogInMenuOptions() {
    showAuthMenuOptions("Log in", false /*isSignup*/);
}
exports.showLogInMenuOptions = showLogInMenuOptions;
function showSignUpMenuOptions() {
    showAuthMenuOptions("Sign up", true /*isSignup*/);
}
exports.showSignUpMenuOptions = showSignUpMenuOptions;
function showAuthMenuOptions(authText, isSignup = true) {
    const items = [];
    const placeholder = `${authText} using...`;
    items.push({
        label: `${authText} with Google`,
        command: "musictime.googleLogin",
        commandArgs: [null /*KpmItem*/, true /*switching_account*/],
    });
    items.push({
        label: `${authText} with GitHub`,
        command: "musictime.githubLogin",
        commandArgs: [null /*KpmItem*/, true /*switching_account*/],
    });
    if (isSignup) {
        items.push({
            label: `${authText} with Email`,
            command: "musictime.emailSignup",
            commandArgs: [null /*KpmItem*/, true /*switching_account*/],
        });
    }
    else {
        items.push({
            label: `${authText} with Email`,
            command: "musictime.emailLogin",
            commandArgs: [null /*KpmItem*/, true /*switching_account*/],
        });
    }
    const menuOptions = {
        items,
        placeholder,
    };
    MenuManager_1.showQuickPick(menuOptions);
}
function launchLogin(loginType = "software", switching_account = false) {
    return __awaiter(this, void 0, void 0, function* () {
        FileManager_1.setItem("authType", loginType);
        FileManager_1.setItem("switching_account", switching_account);
        const jwt = FileManager_1.getItem("jwt");
        const name = FileManager_1.getItem("name");
        const auth_callback_state = FileManager_1.getAuthCallbackState(true);
        let url = "";
        let obj = {
            plugin: Util_1.getPluginType(),
            pluginVersion: Util_1.getVersion(),
            plugin_id: Util_1.getPluginId(),
            plugin_uuid: FileManager_1.getPluginUuid(),
            auth_callback_state,
            login: true,
        };
        if (!name) {
            obj["plugin_token"] = jwt;
        }
        if (loginType === "github") {
            // github signup/login flow
            obj["redirect"] = Constants_1.launch_url;
            url = `${Constants_1.api_endpoint}/auth/github`;
        }
        else if (loginType === "google") {
            // google signup/login flow
            obj["redirect"] = Constants_1.launch_url;
            url = `${Constants_1.api_endpoint}/auth/google`;
        }
        else {
            // email login
            obj["token"] = FileManager_1.getItem("jwt");
            obj["auth"] = "software";
            if (switching_account) {
                obj["login"] = true;
                url = `${Constants_1.launch_url}/onboarding`;
            }
            else {
                url = `${Constants_1.launch_url}/email-signup`;
            }
        }
        const qryStr = queryString.stringify(obj);
        url = `${url}?${qryStr}`;
        Util_1.launchWebUrl(url);
    });
}
exports.launchLogin = launchLogin;
function authenticationCompleteHandler(user) {
    return __awaiter(this, void 0, void 0, function* () {
        // clear the auth callback state
        FileManager_1.setAuthCallbackState(null);
        // set the email and jwt
        if ((user === null || user === void 0 ? void 0 : user.registered) === 1) {
            const currName = FileManager_1.getItem("name");
            if (currName != user.email) {
                if (user.plugin_jwt) {
                    FileManager_1.setItem("jwt", user.plugin_jwt);
                }
                FileManager_1.setItem("name", user.email);
                // update the login status
                vscode_1.window.showInformationMessage(`Successfully registered`);
                try {
                    websockets_1.initializeWebsockets();
                }
                catch (e) {
                    console.error("Failed to initialize websockets", e);
                }
            }
            // update the slack and spotify integrations
            const addedNewSlackIntegration = yield IntegrationManager_1.updateSlackIntegrations(user);
            const addedNewIntegration = yield IntegrationManager_1.updateSpotifyIntegration(user);
            if (addedNewIntegration) {
                // this will refresh the playlist for both slack and spotify
                processNewSpotifyIntegration();
            }
            else if (addedNewSlackIntegration) {
                // refresh the tree view
                setTimeout(() => {
                    // refresh the playlist to show the device button update
                    vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
                }, 1000);
            }
        }
        // initiate the playlist build
        setTimeout(() => {
            vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
        }, 1000);
    });
}
exports.authenticationCompleteHandler = authenticationCompleteHandler;
function processNewSpotifyIntegration() {
    return __awaiter(this, void 0, void 0, function* () {
        FileManager_1.setItem("requiresSpotifyReAuth", false);
        // update the login status
        vscode_1.window.showInformationMessage(`Successfully connected to Spotify. Loading playlists...`);
        // initialize spotify and playlists
        yield PlaylistDataManager_1.initializeSpotify(true /*refreshUser*/);
        // initiate the playlist build
        setTimeout(() => {
            vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
        }, 2000);
    });
}
exports.processNewSpotifyIntegration = processNewSpotifyIntegration;
//# sourceMappingURL=UserStatusManager.js.map
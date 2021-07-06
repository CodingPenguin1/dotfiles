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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSlackIntegration = exports.getSlackAccessToken = exports.hasSlackWorkspaces = exports.getSlackWorkspaces = exports.showSlackChannelMenu = exports.disconnectSlackAuth = exports.disconnectSlack = exports.connectSlackWorkspace = void 0;
const Constants_1 = require("../Constants");
const Util_1 = require("../Util");
const MenuManager_1 = require("../MenuManager");
const vscode_1 = require("vscode");
const HttpClient_1 = require("../HttpClient");
const FileManager_1 = require("./FileManager");
const queryString = require("query-string");
const { WebClient } = require("@slack/web-api");
function connectSlackWorkspace() {
    return __awaiter(this, void 0, void 0, function* () {
        const registered = yield checkRegistration();
        if (!registered) {
            return;
        }
        // make sure the user is logged in before connecting slack
        const qryStr = queryString.stringify({
            plugin: Util_1.getPluginType(),
            plugin_uuid: FileManager_1.getPluginUuid(),
            pluginVersion: Util_1.getVersion(),
            plugin_id: Util_1.getPluginId(),
            auth_callback_state: FileManager_1.getAuthCallbackState(),
            integrate: "slack",
            plugin_token: FileManager_1.getItem("jwt"),
        });
        const url = `${Constants_1.api_endpoint}/auth/slack?${qryStr}`;
        // authorize the user for slack
        Util_1.launchWebUrl(url);
    });
}
exports.connectSlackWorkspace = connectSlackWorkspace;
function disconnectSlack() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const workspaces = getSlackWorkspaces();
        if (workspaces.length === 0) {
            vscode_1.window.showErrorMessage("Unable to find Slack integration to disconnect");
            return;
        }
        // show a selection of which one or all workspaces to disconnect
        const selectedItem = yield showSlackWorkspacesToDisconnect();
        if (selectedItem) {
            let msg = "";
            if (selectedItem === "all") {
                msg = "Are you sure you would like to disconnect all Slack workspaces?";
            }
            else {
                msg = `Are you sure you would like to disconnect this Slack workspace?`;
            }
            // ask before disconnecting
            const selection = yield vscode_1.window.showInformationMessage(msg, ...[Constants_1.DISCONNECT_LABEL]);
            if (selection === Constants_1.DISCONNECT_LABEL) {
                if (selectedItem === "all") {
                    try {
                        for (var workspaces_1 = __asyncValues(workspaces), workspaces_1_1; workspaces_1_1 = yield workspaces_1.next(), !workspaces_1_1.done;) {
                            const workspace = workspaces_1_1.value;
                            yield HttpClient_1.softwareDelete(`/integrations/${workspace.id}`, FileManager_1.getItem("jwt"));
                            removeSlackIntegration(workspace.authId);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (workspaces_1_1 && !workspaces_1_1.done && (_a = workspaces_1.return)) yield _a.call(workspaces_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    vscode_1.window.showInformationMessage("Disconnected selected Slack integrations");
                }
                else {
                    yield HttpClient_1.softwareDelete(`/integrations/${selectedItem}`, FileManager_1.getItem("jwt"));
                    removeSlackIntegration(selectedItem);
                    vscode_1.window.showInformationMessage("Disconnected selected Slack integration");
                }
                // refresh the tree view
                setTimeout(() => {
                    // refresh the playlist to show the device button update
                    vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
                }, 1000);
            }
        }
    });
}
exports.disconnectSlack = disconnectSlack;
// disconnect slack flow
function disconnectSlackAuth(authId) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the domain
        const integration = getSlackWorkspaces().find((n) => n.authId === authId);
        if (!integration) {
            vscode_1.window.showErrorMessage("Unable to find selected integration to disconnect");
            return;
        }
        // ask before disconnecting
        const selection = yield vscode_1.window.showInformationMessage(`Are you sure you would like to disconnect the '${integration.team_domain}' Slack workspace?`, ...[Constants_1.DISCONNECT_LABEL]);
        if (selection === Constants_1.DISCONNECT_LABEL) {
            yield HttpClient_1.softwareDelete(`/integrations/${integration.id}`, FileManager_1.getItem("jwt"));
            // disconnected, remove it from the integrations
            removeSlackIntegration(authId);
            vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
        }
    });
}
exports.disconnectSlackAuth = disconnectSlackAuth;
function showSlackChannelMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        let menuOptions = {
            items: [],
            placeholder: "Select a channel",
        };
        // get the available channels
        let { channels, access_token } = yield getChannels();
        channels.sort(compareLabels);
        // make sure the object array has labels
        channels = channels.map((n) => {
            return Object.assign(Object.assign({}, n), { label: n.name });
        });
        menuOptions.items = channels;
        const pick = yield MenuManager_1.showQuickPick(menuOptions);
        if (pick && pick.label) {
            return { selectedChannel: pick.id, access_token };
        }
        return { selectedChannel: null, access_token };
    });
}
exports.showSlackChannelMenu = showSlackChannelMenu;
// get saved slack integrations
function getSlackWorkspaces() {
    return FileManager_1.getIntegrations().filter((n) => n.name.toLowerCase() === "slack" && n.status.toLowerCase() === "active");
}
exports.getSlackWorkspaces = getSlackWorkspaces;
function hasSlackWorkspaces() {
    return !!getSlackWorkspaces().length;
}
exports.hasSlackWorkspaces = hasSlackWorkspaces;
// get the access token of a selected slack workspace
function getSlackAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const selectedTeamDomain = yield showSlackWorkspaceSelection();
        if (selectedTeamDomain) {
            return getWorkspaceAccessToken(selectedTeamDomain);
        }
        return null;
    });
}
exports.getSlackAccessToken = getSlackAccessToken;
/**
 * Remove an integration from the local copy
 * @param authId
 */
function removeSlackIntegration(authId) {
    const currentIntegrations = FileManager_1.getIntegrations();
    const newIntegrations = currentIntegrations.filter((n) => n.authId !== authId);
    FileManager_1.syncSlackIntegrations(newIntegrations);
}
exports.removeSlackIntegration = removeSlackIntegration;
//////////////////////////
// PRIVATE FUNCTIONS
//////////////////////////
function getChannels() {
    return __awaiter(this, void 0, void 0, function* () {
        const access_token = yield getSlackAccessToken();
        if (!access_token) {
            return;
        }
        const web = new WebClient(access_token);
        const result = yield web.conversations.list({ exclude_archived: true, limit: 1000 }).catch((err) => {
            console.log("Unable to retrieve slack channels: ", err.message);
            return [];
        });
        if (result && result.ok) {
            /**
            created:1493157509
            creator:'U54G1N6LC'
            id:'C53QCUUKS'
            is_archived:false
            is_channel:true
            is_ext_shared:false
            is_general:true
            is_group:false
            is_im:false
            is_member:true
            is_mpim:false
            is_org_shared:false
            is_pending_ext_shared:false
            is_private:false
            is_shared:false
            name:'company-announcements'
            name_normalized:'company-announcements'
            num_members:20
            */
            return { channels: result.channels, access_token };
        }
        return { channels: [], access_token: null };
    });
}
function showSlackWorkspaceSelection() {
    return __awaiter(this, void 0, void 0, function* () {
        let menuOptions = {
            items: [],
            placeholder: `Select a Slack workspace`,
        };
        const integrations = getSlackWorkspaces();
        integrations.forEach((integration) => {
            menuOptions.items.push({
                label: integration.team_domain,
                value: integration.team_domain,
            });
        });
        menuOptions.items.push({
            label: "Connect a Slack workspace",
            command: "musictime.connectSlack",
        });
        const pick = yield MenuManager_1.showQuickPick(menuOptions);
        if (pick) {
            if (pick.value) {
                return pick.value;
            }
            else if (pick.command) {
                vscode_1.commands.executeCommand(pick.command);
                return null;
            }
        }
        return null;
    });
}
function getWorkspaceAccessToken(team_domain) {
    const integration = getSlackWorkspaces().find((n) => n.team_domain === team_domain);
    if (integration) {
        return integration.access_token;
    }
    return null;
}
function showSlackWorkspacesToDisconnect() {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaces = getSlackWorkspaces();
        const items = workspaces.map((n) => {
            return { label: n.team_domain, value: n.authId };
        });
        items.push({ label: "all", value: "all" });
        let menuOptions = {
            items,
            placeholder: "Select a workspace to disconnect",
        };
        const pick = yield MenuManager_1.showQuickPick(menuOptions);
        if (pick && pick.label) {
            return pick.value;
        }
        return null;
    });
}
function checkRegistration(showSignup = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!FileManager_1.getItem("name")) {
            if (showSignup) {
                vscode_1.window
                    .showInformationMessage("Connecting Slack requires a registered account. Sign up or register for a web.com account at Software.com.", {
                    modal: true,
                }, "Sign up")
                    .then((selection) => __awaiter(this, void 0, void 0, function* () {
                    if (selection === "Sign up") {
                        vscode_1.commands.executeCommand("musictime.signUpAccount");
                    }
                }));
            }
            return false;
        }
        return true;
    });
}
function compareLabels(a, b) {
    if (a.name > b.name)
        return 1;
    if (b.name > a.name)
        return -1;
    return 0;
}
//# sourceMappingURL=SlackManager.js.map
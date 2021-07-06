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
exports.clearSpotifyIntegrations = exports.updateSlackIntegrations = exports.updateSpotifyIntegration = void 0;
const FileManager_1 = require("./FileManager");
const { WebClient } = require("@slack/web-api");
function updateSpotifyIntegration(user) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const existingSpotifyIntegrations = FileManager_1.getIntegrations().filter((n) => n.name.toLowerCase() === "spotify");
        const existingSpotifyIntegration = getLatestSpotifyIntegration(existingSpotifyIntegrations);
        if ((_a = user === null || user === void 0 ? void 0 : user.integrations) === null || _a === void 0 ? void 0 : _a.length) {
            const spotifyIntegrations = user.integrations.filter((n) => n.name.toLowerCase() === "spotify" && n.status.toLowerCase() === "active" && n.access_token);
            if (spotifyIntegrations.length) {
                const spotifyIntegration = getLatestSpotifyIntegration(spotifyIntegrations);
                if (spotifyIntegration) {
                    FileManager_1.syncSpotifyIntegration(spotifyIntegration);
                    if (!existingSpotifyIntegration || existingSpotifyIntegration.authId !== spotifyIntegration.authId) {
                        return true;
                    }
                }
            }
        }
        return false;
    });
}
exports.updateSpotifyIntegration = updateSpotifyIntegration;
function getLatestSpotifyIntegration(spotifyIntegrations) {
    if (spotifyIntegrations === null || spotifyIntegrations === void 0 ? void 0 : spotifyIntegrations.length) {
        const sorted = spotifyIntegrations.sort((a, b) => {
            const aDate = new Date(a.updatedAt).getTime();
            const bDate = new Date(b.updatedAt).getTime();
            if (aDate > bDate)
                return 1;
            if (aDate < bDate)
                return -1;
            return 0;
        });
        return sorted[0];
    }
    return null;
}
function updateSlackIntegrations(user) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let foundNewIntegration = false;
        const slackIntegrations = [];
        if (user && user.integrations) {
            const currentIntegrations = FileManager_1.getIntegrations();
            for (const integration of user.integrations) {
                const isSlackIntegration = !!(integration.name.toLowerCase() === "slack" &&
                    integration.status.toLowerCase() === "active" &&
                    integration.access_token);
                if (isSlackIntegration) {
                    const currentIntegration = currentIntegrations === null || currentIntegrations === void 0 ? void 0 : currentIntegrations.find((n) => n.authId === integration.authId);
                    if (!currentIntegration || !currentIntegration.team_domain) {
                        // get the workspace domain using the authId
                        const web = new WebClient(integration.access_token);
                        const usersIdentify = yield web.users.identity().catch((e) => {
                            console.log("Error fetching slack team info: ", e.message);
                            return null;
                        });
                        if (usersIdentify) {
                            // usersIdentity returns
                            // {team: {id, name, domain, image_102, image_132, ....}...}
                            // set the domain
                            integration["team_domain"] = (_a = usersIdentify.team) === null || _a === void 0 ? void 0 : _a.domain;
                            integration["team_name"] = (_b = usersIdentify.team) === null || _b === void 0 ? void 0 : _b.name;
                            integration["integration_id"] = (_c = usersIdentify.user) === null || _c === void 0 ? void 0 : _c.id;
                            // add it
                            currentIntegrations.push(integration);
                            foundNewIntegration = true;
                            slackIntegrations.push(integration);
                        }
                    }
                    else {
                        // add the existing one back
                        slackIntegrations.push(currentIntegration);
                    }
                }
            }
        }
        FileManager_1.syncSlackIntegrations(slackIntegrations);
        return foundNewIntegration;
    });
}
exports.updateSlackIntegrations = updateSlackIntegrations;
function clearSpotifyIntegrations() {
    FileManager_1.syncSpotifyIntegration(null);
}
exports.clearSpotifyIntegrations = clearSpotifyIntegrations;
//# sourceMappingURL=IntegrationManager.js.map
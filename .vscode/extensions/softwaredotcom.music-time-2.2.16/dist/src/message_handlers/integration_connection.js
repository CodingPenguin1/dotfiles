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
exports.handleIntegrationConnectionSocketEvent = void 0;
const vscode_1 = require("vscode");
const FileManager_1 = require("../managers/FileManager");
const IntegrationManager_1 = require("../managers/IntegrationManager");
const SpotifyManager_1 = require("../managers/SpotifyManager");
const UserStatusManager_1 = require("../managers/UserStatusManager");
function handleIntegrationConnectionSocketEvent(body) {
    return __awaiter(this, void 0, void 0, function* () {
        // integration_type_id = 14 (slack), 12 (spotify)
        // action = add, update, remove
        const { integration_type_id, integration_type, action } = body;
        const user = yield UserStatusManager_1.getUser(FileManager_1.getItem("jwt"));
        if (integration_type_id === 14) {
            yield IntegrationManager_1.updateSlackIntegrations(user);
            if (action === "add") {
                // clear the auth callback state
                FileManager_1.setAuthCallbackState(null);
                vscode_1.window.showInformationMessage("Successfully connected to Slack");
                // refresh the tree view
                setTimeout(() => {
                    // refresh the playlist to show the device button update
                    vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
                }, 1000);
            }
            yield IntegrationManager_1.updateSlackIntegrations(user);
        }
        else if (integration_type_id === 12) {
            // clear the auth callback state
            FileManager_1.setAuthCallbackState(null);
            // update the spotify integrations before populating the spotify user
            const updatedNewIntegration = yield IntegrationManager_1.updateSpotifyIntegration(user);
            // clear the polling timer
            SpotifyManager_1.updateAddedNewIntegration(updatedNewIntegration);
            UserStatusManager_1.processNewSpotifyIntegration();
        }
    });
}
exports.handleIntegrationConnectionSocketEvent = handleIntegrationConnectionSocketEvent;
//# sourceMappingURL=integration_connection.js.map
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
exports.showSearchInput = void 0;
const vscode_1 = require("vscode");
const cody_music_1 = require("cody-music");
const PlaylistDataManager_1 = require("../managers/PlaylistDataManager");
function showSearchInput() {
    return __awaiter(this, void 0, void 0, function* () {
        if (PlaylistDataManager_1.requiresSpotifyAccess()) {
            vscode_1.window.showInformationMessage("Spotify connection required");
            return;
        }
        let keywords = yield vscode_1.window.showInputBox({
            value: "",
            placeHolder: "Search",
            prompt: "Search for songs",
            validateInput: (text) => {
                return !text ? "Please enter one more more keywords to continue." : null;
            },
        });
        if (!keywords) {
            return;
        }
        keywords = keywords.trim();
        // the default limit is 50, so just send in the keywords
        const result = yield cody_music_1.searchTracks(keywords, 50 /*limit*/);
        if (result && result.tracks && result.tracks.items && result.tracks.items.length) {
            PlaylistDataManager_1.populateRecommendationTracks(keywords, result.tracks.items);
        }
        else {
            vscode_1.window.showErrorMessage(`No songs found matching '${keywords}'`);
        }
    });
}
exports.showSearchInput = showSearchInput;
//# sourceMappingURL=SearchSelectorManager.js.map
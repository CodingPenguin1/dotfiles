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
exports.MusicStateManager = void 0;
const Util_1 = require("../Util");
const cody_music_1 = require("cody-music");
const MusicCommandManager_1 = require("./MusicCommandManager");
const ExecManager_1 = require("../managers/ExecManager");
const PlaylistDataManager_1 = require("../managers/PlaylistDataManager");
const path = require("path");
const moment = require("moment-timezone");
const resourcePath = path.join(__dirname, "resources");
class MusicStateManager {
    constructor() {
        this.existingTrack = new cody_music_1.Track();
        // private to prevent non-singleton usage
    }
    static getInstance() {
        if (!MusicStateManager.instance) {
            MusicStateManager.instance = new MusicStateManager();
        }
        return MusicStateManager.instance;
    }
    fetchPlayingTrack() {
        return cody_music_1.getTrack(cody_music_1.PlayerName.SpotifyWeb);
    }
    /**
     * Core logic in gathering tracks. This is called every 20 seconds.
     */
    fetchTrack() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requiresAccess = PlaylistDataManager_1.requiresSpotifyAccess();
                if (requiresAccess) {
                    // either no device ID, requires spotify connection,
                    // or it's a windows device that is not online
                    PlaylistDataManager_1.updateCachedRunningTrack(undefined);
                    return;
                }
                const device = PlaylistDataManager_1.getBestActiveDevice();
                // check if we've set the existing device id but don't have a device
                if ((!this.existingTrack || !this.existingTrack.id) && !(device === null || device === void 0 ? void 0 : device.id) && !Util_1.isMac()) {
                    // no existing track and no device, skip checking
                    PlaylistDataManager_1.updateCachedRunningTrack(undefined);
                    return;
                }
                let playingTrack = null;
                if (Util_1.isMac()) {
                    // fetch from the desktop
                    playingTrack = yield this.fetchSpotifyMacTrack();
                    // applescript doesn't always return a name
                    if (device && (!playingTrack || !playingTrack.name)) {
                        playingTrack = yield cody_music_1.getTrack(cody_music_1.PlayerName.SpotifyWeb);
                    }
                }
                else {
                    playingTrack = yield cody_music_1.getTrack(cody_music_1.PlayerName.SpotifyWeb);
                }
                if (!playingTrack) {
                    // make an empty track
                    playingTrack = new cody_music_1.Track();
                }
                const isValidTrack = this.isValidTrack(playingTrack);
                // convert the playing track id to an id
                if (isValidTrack) {
                    if (!playingTrack.uri) {
                        playingTrack.uri = Util_1.createUriFromTrackId(playingTrack.id);
                    }
                    playingTrack.id = Util_1.createSpotifyIdFromUri(playingTrack.id);
                }
                this.existingTrack = Object.assign({}, playingTrack);
                MusicCommandManager_1.MusicCommandManager.syncControls(this.existingTrack);
                PlaylistDataManager_1.updateCachedRunningTrack(this.existingTrack);
            }
            catch (e) {
                const errMsg = e.message || e;
                console.error(`Unexpected track state processing error: ${errMsg}`);
            }
        });
    }
    isValidTrack(playingTrack) {
        if (playingTrack && playingTrack.id) {
            return true;
        }
        return false;
    }
    updateRunningTrackToMostRecentlyPlayed() {
        return __awaiter(this, void 0, void 0, function* () {
            // get the most recently played track
            const before = moment().utc().valueOf();
            const resp = yield cody_music_1.getSpotifyRecentlyPlayedBefore(1, before);
            if (resp && resp.data && resp.data.tracks && resp.data.tracks.length) {
                return resp.data.tracks[0];
            }
        });
    }
    fetchSpotifyMacTrack() {
        return __awaiter(this, void 0, void 0, function* () {
            const checkStateScript = path.join(resourcePath, "scripts", "check_state.spotify.applescript");
            const getSpotifyTrackInfo = path.join(resourcePath, "scripts", "get_state.spotify.applescript");
            const isRunning = ExecManager_1.execCmd(`osascript ${checkStateScript}`);
            if (isRunning === "true") {
                // get the track info
                const trackInfo = ExecManager_1.execCmd(`osascript ${getSpotifyTrackInfo}`);
                try {
                    return JSON.parse(trackInfo);
                }
                catch (e) { }
            }
            return null;
        });
    }
}
exports.MusicStateManager = MusicStateManager;
//# sourceMappingURL=MusicStateManager.js.map
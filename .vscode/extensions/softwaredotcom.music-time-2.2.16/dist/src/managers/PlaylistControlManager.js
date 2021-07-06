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
exports.playPreviousLikedSongs = exports.playNextLikedSong = exports.showPlayerLaunchConfirmation = exports.playInitialization = exports.launchTrackPlayer = exports.playSelectedItem = void 0;
const cody_music_1 = require("cody-music");
const vscode_1 = require("vscode");
const view_constants_1 = require("../app/utils/view_constants");
const MusicCommandUtil_1 = require("../music/MusicCommandUtil");
const MusicStateManager_1 = require("../music/MusicStateManager");
const Util_1 = require("../Util");
const PlaylistDataManager_1 = require("./PlaylistDataManager");
const SpotifyManager_1 = require("./SpotifyManager");
// PLAY SELECTED TRACK
function playSelectedItem(playlistItem) {
    return __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.updateSelectedTrackItem(playlistItem);
        // ask to launch web or desktop if neither are running
        yield playInitialization(playMusicSelection);
    });
}
exports.playSelectedItem = playSelectedItem;
function launchTrackPlayer(playerName = null, callback = null) {
    return __awaiter(this, void 0, void 0, function* () {
        const { webPlayer, desktop, activeDevice, activeComputerDevice, activeWebPlayerDevice, activeDesktopPlayerDevice } = PlaylistDataManager_1.getDeviceSet();
        const hasDesktopDevice = activeDesktopPlayerDevice || desktop ? true : false;
        const requiresDesktopLaunch = !SpotifyManager_1.isPremiumUser() && Util_1.isMac() && !hasDesktopDevice ? true : false;
        if (requiresDesktopLaunch && playerName !== cody_music_1.PlayerName.SpotifyDesktop) {
            vscode_1.window.showInformationMessage("Launching Spotify desktop instead of the web player to allow playback as a non-premium account");
        }
        if (requiresDesktopLaunch || playerName === cody_music_1.PlayerName.SpotifyDesktop) {
            PlaylistDataManager_1.updateSelectedPlayer(cody_music_1.PlayerName.SpotifyDesktop);
        }
        else {
            PlaylistDataManager_1.updateSelectedPlayer(cody_music_1.PlayerName.SpotifyWeb);
        }
        // {playlist_id | album_id | track_id, quietly }
        const options = {
            quietly: false,
        };
        const selectedTrack = PlaylistDataManager_1.getSelectedTrackItem();
        if (selectedTrack) {
            const selectedPlaylist = PlaylistDataManager_1.getPlaylistById(selectedTrack["playlist_id"]);
            if (selectedPlaylist) {
                options["playlist_id"] = selectedTrack["playlist_id"];
            }
            else if (selectedTrack) {
                options["track_id"] = selectedTrack.id;
            }
        }
        // spotify device launch error would look like ..
        // error:"Command failed: open -a spotify\nUnable to find application named 'spotify'\n"
        const result = yield cody_music_1.launchPlayer(playerName, options);
        // test if there was an error, fallback to the web player
        if (playerName === cody_music_1.PlayerName.SpotifyDesktop && result && result.error && result.error.includes("failed")) {
            // start the process of launching the web player
            playerName = cody_music_1.PlayerName.SpotifyWeb;
            yield cody_music_1.launchPlayer(playerName, options);
        }
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield cody_music_1.play(PlaylistDataManager_1.getSelectedPlayerName());
            checkDeviceLaunch(playerName, 5, callback);
        }), 3000);
    });
}
exports.launchTrackPlayer = launchTrackPlayer;
// PRIVATE FUNCTIONS
function playInitialization(callback = null) {
    return __awaiter(this, void 0, void 0, function* () {
        const { desktop } = PlaylistDataManager_1.getDeviceSet();
        const device = PlaylistDataManager_1.getBestActiveDevice();
        if (!SpotifyManager_1.hasSpotifyUser()) {
            // try again
            yield SpotifyManager_1.populateSpotifyUser();
        }
        const requiresDesktopLaunch = !SpotifyManager_1.isPremiumUser() && Util_1.isMac() && !desktop ? true : false;
        if (!device || requiresDesktopLaunch) {
            return yield showPlayerLaunchConfirmation(callback);
        }
        else {
            // check to see if we need to change the selected player type
            if (device.type === "Computer" && PlaylistDataManager_1.getSelectedPlayerName() !== cody_music_1.PlayerName.SpotifyDesktop) {
                PlaylistDataManager_1.updateSelectedPlayer(cody_music_1.PlayerName.SpotifyDesktop);
            }
        }
        // we have a device, continue to the callback if we have it
        if (callback) {
            callback();
        }
    });
}
exports.playInitialization = playInitialization;
function showPlayerLaunchConfirmation(callback = null) {
    return __awaiter(this, void 0, void 0, function* () {
        // if they're a mac non-premium user, just launch the desktop player
        if (Util_1.isMac() && !SpotifyManager_1.isPremiumUser()) {
            return launchTrackPlayer(cody_music_1.PlayerName.SpotifyDesktop, callback);
        }
        else {
            const buttons = ["Web Player", "Desktop Player"];
            // no devices found at all OR no active devices and a computer device is not found in the list
            const selectedButton = yield vscode_1.window.showInformationMessage(`Music Time requires a running Spotify player. Choose a player to launch.`, ...buttons);
            if (selectedButton === "Desktop Player" || selectedButton === "Web Player") {
                PlaylistDataManager_1.updateSelectedPlayer(selectedButton === "Desktop Player" ? cody_music_1.PlayerName.SpotifyDesktop : cody_music_1.PlayerName.SpotifyWeb);
                // start the launch process and pass the callback when complete
                return launchTrackPlayer(PlaylistDataManager_1.getSelectedPlayerName(), callback);
            }
        }
        return;
    });
}
exports.showPlayerLaunchConfirmation = showPlayerLaunchConfirmation;
function checkDeviceLaunch(playerName, tries = 5, callback = null) {
    return __awaiter(this, void 0, void 0, function* () {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield PlaylistDataManager_1.populateSpotifyDevices(true /*retry*/);
            const devices = PlaylistDataManager_1.getCurrentDevices();
            if ((!devices || devices.length == 0) && tries >= 0) {
                tries--;
                checkDeviceLaunch(playerName, tries, callback);
            }
            else {
                const device = PlaylistDataManager_1.getBestActiveDevice();
                if (!device && !Util_1.isMac()) {
                    vscode_1.window.showInformationMessage("Unable to detect a connected Spotify device. Please make sure you are logged into your account.");
                }
                vscode_1.commands.executeCommand("musictime.refreshDeviceInfo");
                if (callback) {
                    callback();
                }
            }
        }), 1100);
    });
}
function checkPlayingState(deviceId, tries = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        tries--;
        const track = yield MusicStateManager_1.MusicStateManager.getInstance().fetchPlayingTrack();
        if (!track || track.state !== cody_music_1.TrackStatus.Playing) {
            if (tries >= 0) {
                setTimeout(() => {
                    checkPlayingState(deviceId, tries);
                }, 2000);
            }
            else {
                // try to play it
                yield cody_music_1.transferSpotifyDevice(deviceId, true);
                cody_music_1.play(PlaylistDataManager_1.getSelectedPlayerName());
            }
        }
    });
}
function playMusicSelection() {
    return __awaiter(this, void 0, void 0, function* () {
        const selectedPlaylistItem = PlaylistDataManager_1.getSelectedTrackItem();
        if (!selectedPlaylistItem) {
            return;
        }
        const musicCommandUtil = MusicCommandUtil_1.MusicCommandUtil.getInstance();
        // get the playlist id, track id, and device id
        const device = PlaylistDataManager_1.getBestActiveDevice();
        const playlist_id = PlaylistDataManager_1.getSelectedPlaylistId();
        const selectedPlayer = PlaylistDataManager_1.getSelectedPlayerName() || cody_music_1.PlayerName.SpotifyWeb;
        const isLikedSong = !!(playlist_id === view_constants_1.SPOTIFY_LIKED_SONGS_PLAYLIST_ID);
        const desktopSelected = !!(selectedPlayer === cody_music_1.PlayerName.SpotifyDesktop);
        const isRecommendationTrack = !!(selectedPlaylistItem.type === "recommendation" || selectedPlaylistItem["playlist_id"] === view_constants_1.RECOMMENDATION_PLAYLIST_ID);
        const trackId = Util_1.createSpotifyIdFromUri(selectedPlaylistItem.id);
        const trackUri = Util_1.createUriFromTrackId(selectedPlaylistItem.id);
        let result = undefined;
        if (isRecommendationTrack || isLikedSong) {
            try {
                if (isRecommendationTrack) {
                    const recommendationTrackUris = PlaylistDataManager_1.getRecommendationURIsFromTrackId(trackId);
                    cody_music_1.play(cody_music_1.PlayerName.SpotifyWeb, { device_id: device === null || device === void 0 ? void 0 : device.id, uris: recommendationTrackUris, offset: 0 });
                }
                else {
                    const likedTrackUris = PlaylistDataManager_1.getLikedURIsFromTrackId(trackId);
                    cody_music_1.play(cody_music_1.PlayerName.SpotifyWeb, { device_id: device === null || device === void 0 ? void 0 : device.id, uris: likedTrackUris, offset: 0 });
                }
            }
            catch (e) { }
        }
        else {
            if (Util_1.isMac() && desktopSelected) {
                // play it using applescript
                const playlistUri = Util_1.createUriFromPlaylistId(playlist_id);
                const params = [trackUri, playlistUri];
                try {
                    result = yield cody_music_1.playTrackInContext(selectedPlayer, params);
                }
                catch (e) { }
            }
            if (!result || result !== "ok") {
                // try with the web player
                result = yield musicCommandUtil.runSpotifyCommand(cody_music_1.playSpotifyPlaylist, [playlist_id, trackId, device === null || device === void 0 ? void 0 : device.id]);
            }
        }
        setTimeout(() => {
            MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            checkPlayingState(device.id);
        }, 1000);
    });
}
function playNextLikedSong() {
    return __awaiter(this, void 0, void 0, function* () {
        const likedSongs = PlaylistDataManager_1.getCachedLikedSongsTracks();
        const nextIdx = getNextOrPrevLikedIndex(true);
        let nextLikedTrack = likedSongs[nextIdx];
        const selectedPlayer = PlaylistDataManager_1.getSelectedPlayerName() || cody_music_1.PlayerName.SpotifyWeb;
        cody_music_1.playTrackInContext(selectedPlayer, [Util_1.createUriFromTrackId(nextLikedTrack.id)]);
    });
}
exports.playNextLikedSong = playNextLikedSong;
function playPreviousLikedSongs() {
    return __awaiter(this, void 0, void 0, function* () {
        const likedSongs = PlaylistDataManager_1.getCachedLikedSongsTracks();
        const prevIdx = getNextOrPrevLikedIndex(false);
        let nextLikedTrack = likedSongs[prevIdx];
        const selectedPlayer = PlaylistDataManager_1.getSelectedPlayerName() || cody_music_1.PlayerName.SpotifyWeb;
        cody_music_1.playTrackInContext(selectedPlayer, [Util_1.createUriFromTrackId(nextLikedTrack.id)]);
    });
}
exports.playPreviousLikedSongs = playPreviousLikedSongs;
function getNextOrPrevLikedIndex(get_next) {
    const likedSongs = PlaylistDataManager_1.getCachedLikedSongsTracks();
    const selectedTrack = PlaylistDataManager_1.getSelectedTrackItem();
    const nextIdx = likedSongs === null || likedSongs === void 0 ? void 0 : likedSongs.findIndex((n) => n.id === selectedTrack.id);
    if (get_next) {
        // get next
        if (nextIdx + 1 >= likedSongs.length) {
            return 0;
        }
        return nextIdx + 1;
    }
    // get prev
    if (nextIdx - 1 < 0) {
        return likedSongs.length - 1;
    }
    else {
        return nextIdx - 1;
    }
}
//# sourceMappingURL=PlaylistControlManager.js.map
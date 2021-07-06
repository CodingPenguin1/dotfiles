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
exports.displayMusicTimeMetricsMarkdownDashboard = exports.buildSpotifyLink = exports.MusicControlManager = void 0;
const cody_music_1 = require("cody-music");
const vscode_1 = require("vscode");
const MusicCommandManager_1 = require("./MusicCommandManager");
const MenuManager_1 = require("../MenuManager");
const PlaylistControlManager_1 = require("../managers/PlaylistControlManager");
const Util_1 = require("../Util");
const view_constants_1 = require("../app/utils/view_constants");
const MusicStateManager_1 = require("./MusicStateManager");
const SocialShareManager_1 = require("../social/SocialShareManager");
const os_1 = require("os");
const MusicPlaylistManager_1 = require("./MusicPlaylistManager");
const MusicCommandUtil_1 = require("./MusicCommandUtil");
const FileManager_1 = require("../managers/FileManager");
const SpotifyManager_1 = require("../managers/SpotifyManager");
const PlaylistDataManager_1 = require("../managers/PlaylistDataManager");
const SlackManager_1 = require("../managers/SlackManager");
const fileIt = require("file-it");
const clipboardy = require("clipboardy");
class MusicControlManager {
    constructor() {
        this.currentTrackToAdd = null;
        //
    }
    static getInstance() {
        if (!MusicControlManager.instance) {
            MusicControlManager.instance = new MusicControlManager();
        }
        return MusicControlManager.instance;
    }
    nextSong() {
        return __awaiter(this, void 0, void 0, function* () {
            if (PlaylistDataManager_1.isLikedSongPlaylistSelected()) {
                yield PlaylistControlManager_1.playNextLikedSong();
            }
            else if (this.useSpotifyDesktop()) {
                yield cody_music_1.next(cody_music_1.PlayerName.SpotifyDesktop);
            }
            else {
                yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.next, [cody_music_1.PlayerName.SpotifyWeb]);
            }
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    previousSong() {
        return __awaiter(this, void 0, void 0, function* () {
            if (PlaylistDataManager_1.isLikedSongPlaylistSelected()) {
                yield PlaylistControlManager_1.playPreviousLikedSongs();
            }
            else if (this.useSpotifyDesktop()) {
                yield cody_music_1.previous(cody_music_1.PlayerName.SpotifyDesktop);
            }
            else {
                yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.previous, [cody_music_1.PlayerName.SpotifyWeb]);
            }
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    /**
     * {status, state, statusText, message, data.status, error}
     */
    playSong(tries = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            const deviceId = PlaylistDataManager_1.getBestActiveDevice();
            const controlMgr = MusicControlManager.getInstance();
            if (!deviceId && tries === 1) {
                // initiate the device selection prompt
                yield PlaylistControlManager_1.playInitialization(controlMgr.playSong);
            }
            else {
                let runningTrack = yield cody_music_1.getRunningTrack();
                if (!runningTrack || !runningTrack.id) {
                    runningTrack = yield cody_music_1.getTrack(cody_music_1.PlayerName.SpotifyWeb);
                    if (!runningTrack || !runningTrack.id) {
                        runningTrack = yield MusicStateManager_1.MusicStateManager.getInstance().updateRunningTrackToMostRecentlyPlayed();
                        const device = PlaylistDataManager_1.getBestActiveDevice();
                        const result = yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.play, [
                            cody_music_1.PlayerName.SpotifyWeb,
                            {
                                track_ids: [runningTrack.id],
                                device_id: device === null || device === void 0 ? void 0 : device.id,
                                offset: 0,
                            },
                        ]);
                    }
                }
                else {
                    if (controlMgr.useSpotifyDesktop()) {
                        result = yield cody_music_1.play(cody_music_1.PlayerName.SpotifyDesktop);
                    }
                    else {
                        result = yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.play, [cody_music_1.PlayerName.SpotifyWeb]);
                    }
                    if (result && (result.status < 300 || result === "ok")) {
                        MusicCommandManager_1.MusicCommandManager.syncControls(runningTrack, true, cody_music_1.TrackStatus.Playing);
                    }
                }
                setTimeout(() => {
                    MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
                }, 1000);
            }
        });
    }
    pauseSong() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            if (this.useSpotifyDesktop()) {
                result = yield cody_music_1.pause(cody_music_1.PlayerName.SpotifyDesktop);
            }
            else {
                result = yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.pause, [cody_music_1.PlayerName.SpotifyWeb]);
            }
            if (result && (result.status < 300 || result === "ok")) {
                MusicCommandManager_1.MusicCommandManager.syncControls(yield cody_music_1.getRunningTrack(), true, cody_music_1.TrackStatus.Paused);
            }
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    setShuffleOn() {
        return __awaiter(this, void 0, void 0, function* () {
            const device = PlaylistDataManager_1.getBestActiveDevice();
            yield cody_music_1.setShuffle(cody_music_1.PlayerName.SpotifyWeb, true, device === null || device === void 0 ? void 0 : device.id);
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    setShuffleOff() {
        return __awaiter(this, void 0, void 0, function* () {
            const device = PlaylistDataManager_1.getBestActiveDevice();
            yield cody_music_1.setShuffle(cody_music_1.PlayerName.SpotifyWeb, false, device === null || device === void 0 ? void 0 : device.id);
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    setRepeatTrackOn() {
        return __awaiter(this, void 0, void 0, function* () {
            const device = PlaylistDataManager_1.getBestActiveDevice();
            yield cody_music_1.setRepeatTrack(cody_music_1.PlayerName.SpotifyWeb, device === null || device === void 0 ? void 0 : device.id);
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    setRepeatPlaylistOn() {
        return __awaiter(this, void 0, void 0, function* () {
            const device = PlaylistDataManager_1.getBestActiveDevice();
            yield cody_music_1.setRepeatPlaylist(cody_music_1.PlayerName.SpotifyWeb, device === null || device === void 0 ? void 0 : device.id);
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    setRepeatOnOff(setToOn) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            if (setToOn) {
                result = yield cody_music_1.repeatOn(cody_music_1.PlayerName.SpotifyWeb);
            }
            else {
                result = yield cody_music_1.repeatOff(cody_music_1.PlayerName.SpotifyWeb);
            }
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    setMuteOn() {
        return __awaiter(this, void 0, void 0, function* () {
            const playerDevice = PlaylistDataManager_1.getBestActiveDevice();
            yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.mute, [cody_music_1.PlayerName.SpotifyWeb, playerDevice === null || playerDevice === void 0 ? void 0 : playerDevice.id]);
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    setMuteOff() {
        return __awaiter(this, void 0, void 0, function* () {
            const playerDevice = PlaylistDataManager_1.getBestActiveDevice();
            // setVolume(PlayerName.SpotifyWeb, 50);
            const result = yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.unmute, [cody_music_1.PlayerName.SpotifyWeb, playerDevice === null || playerDevice === void 0 ? void 0 : playerDevice.id]);
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    useSpotifyDesktop() {
        const { webPlayer, desktop, activeDevice, activeComputerDevice, activeWebPlayerDevice, activeDesktopPlayerDevice } = PlaylistDataManager_1.getDeviceSet();
        if (Util_1.isMac() && (desktop || activeDesktopPlayerDevice)) {
            return true;
        }
        return false;
    }
    /**
     * Launch and play a spotify track via the web player.
     * @param isTrack boolean
     */
    playSpotifyWebPlaylistTrack(isTrack, devices) {
        return __awaiter(this, void 0, void 0, function* () {
            const trackRepeating = yield PlaylistDataManager_1.isTrackRepeating();
            // get the selected track
            const selectedTrack = PlaylistDataManager_1.getSelectedTrackItem();
            const isLikedSongsPlaylist = selectedTrack["playlist_id"] === view_constants_1.SPOTIFY_LIKED_SONGS_PLAYLIST_NAME;
            const playlistId = isLikedSongsPlaylist ? "" : selectedTrack["playlist_id"];
            if (isLikedSongsPlaylist) {
                yield this.playSpotifyByTrack(selectedTrack, devices);
            }
            else if (isTrack) {
                yield this.playSpotifyByTrackAndPlaylist(playlistId, selectedTrack.id);
            }
            else {
                // play the playlist
                yield this.playSpotifyByTrackAndPlaylist(playlistId, "");
            }
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                if (trackRepeating) {
                    // make sure it set to repeat
                    vscode_1.commands.executeCommand("musictime.repeatOn");
                }
                else {
                    // set it to not repeat
                    vscode_1.commands.executeCommand("musictime.repeatOff");
                }
                setTimeout(() => {
                    MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
                }, 1000);
            }), 2000);
        });
    }
    /**
     * Helper function to play a track or playlist if we've determined to play
     * against the mac spotify desktop app.
     */
    playSpotifyDesktopPlaylistTrack(devices) {
        return __awaiter(this, void 0, void 0, function* () {
            const trackRepeating = yield PlaylistDataManager_1.isTrackRepeating();
            const selectedTrack = PlaylistDataManager_1.getSelectedTrackItem();
            // get the selected playlist
            const isPrem = SpotifyManager_1.isPremiumUser();
            const isWin = Util_1.isWindows();
            // get the selected track
            const isLikedSongsPlaylist = selectedTrack["playlist_id"] === view_constants_1.SPOTIFY_LIKED_SONGS_PLAYLIST_NAME;
            if (isLikedSongsPlaylist) {
                if ((!isWin || isPrem) && devices && devices.length > 0) {
                    // just play the 1st track
                    this.playSpotifyByTrack(selectedTrack, devices);
                }
                else if (!isWin) {
                    // try with the desktop app
                    cody_music_1.playSpotifyMacDesktopTrack(selectedTrack.id);
                }
                else {
                    // just try to play it since it's windows and we don't have a device
                    cody_music_1.playSpotifyTrack(selectedTrack.id, "");
                }
            }
            else {
                if (!isWin) {
                    // ex: ["spotify:track:0R8P9KfGJCDULmlEoBagcO", "spotify:playlist:6ZG5lRT77aJ3btmArcykra"]
                    // make sure the track has spotify:track and the playlist has spotify:playlist
                    cody_music_1.playSpotifyMacDesktopTrack(selectedTrack.id, selectedTrack["playlist_id"]);
                }
                else {
                    this.playSpotifyByTrackAndPlaylist(selectedTrack["playlist_id"], selectedTrack.id);
                }
            }
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                if (trackRepeating) {
                    // make sure it set to repeat
                    vscode_1.commands.executeCommand("musictime.repeatOn");
                }
                else {
                    // set it to not repeat
                    vscode_1.commands.executeCommand("musictime.repeatOff");
                }
                setTimeout(() => {
                    MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
                }, 1000);
            }), 2000);
        });
    }
    playSpotifyByTrackAndPlaylist(playlistId, trackId) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = PlaylistDataManager_1.getBestActiveDevice();
            // just play the 1st track
            yield cody_music_1.playSpotifyPlaylist(playlistId, trackId, device === null || device === void 0 ? void 0 : device.id);
        });
    }
    playSpotifyByTrack(track, devices = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = PlaylistDataManager_1.getBestActiveDevice();
            if (device) {
                cody_music_1.playSpotifyTrack(track.id, device.id);
            }
            else if (!Util_1.isWindows()) {
                // try with the desktop app
                cody_music_1.playSpotifyMacDesktopTrack(track.id);
            }
            else {
                // just try to play it without the device
                cody_music_1.playSpotifyTrack(track.id, "");
            }
        });
    }
    setLiked(track, liked) {
        return __awaiter(this, void 0, void 0, function* () {
            let trackId = track === null || track === void 0 ? void 0 : track.id;
            if (!trackId) {
                // check to see if we have a running track
                const runningTrack = yield PlaylistDataManager_1.getCachedRunningTrack();
                track = PlaylistDataManager_1.createPlaylistItemFromTrack(runningTrack, 0);
                trackId = runningTrack === null || runningTrack === void 0 ? void 0 : runningTrack.id;
            }
            if (!trackId) {
                vscode_1.window.showInformationMessage(`No track currently playing. Please play a track to use this feature.`);
                return;
            }
            let isRecommendationTrack = false;
            let selectedPlaylistId = PlaylistDataManager_1.getSelectedPlaylistId();
            if (!selectedPlaylistId) {
                selectedPlaylistId = track["playlist_id"];
            }
            if (selectedPlaylistId === view_constants_1.RECOMMENDATION_PLAYLIST_ID) {
                isRecommendationTrack = true;
            }
            // save the spotify track to the users liked songs playlist
            if (liked) {
                yield cody_music_1.saveToSpotifyLiked([trackId]);
                // add it to the liked songs playlist
                PlaylistDataManager_1.addTrackToLikedPlaylist(track);
            }
            else {
                yield cody_music_1.removeFromSpotifyLiked([trackId]);
                // remove from the cached liked list
                PlaylistDataManager_1.removeTrackFromLikedPlaylist(trackId);
            }
            if (isRecommendationTrack) {
                PlaylistDataManager_1.updateLikedStatusInPlaylist(selectedPlaylistId, trackId, liked);
                vscode_1.commands.executeCommand("musictime.refreshMusicTimeView", "recommendations", selectedPlaylistId);
            }
            else {
                // update liked state in the playlist the track is in
                if (selectedPlaylistId !== view_constants_1.SPOTIFY_LIKED_SONGS_PLAYLIST_ID) {
                    PlaylistDataManager_1.updateLikedStatusInPlaylist(selectedPlaylistId, trackId, liked);
                }
                if (selectedPlaylistId) {
                    vscode_1.commands.executeCommand("musictime.refreshMusicTimeView", "playlists", selectedPlaylistId);
                }
            }
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 1000);
        });
    }
    copySpotifyLink(id, isPlaylist) {
        return __awaiter(this, void 0, void 0, function* () {
            let link = buildSpotifyLink(id, isPlaylist);
            if (id === view_constants_1.SPOTIFY_LIKED_SONGS_PLAYLIST_NAME) {
                link = "https://open.spotify.com/collection/tracks";
            }
            let messageContext = "";
            if (isPlaylist) {
                messageContext = "playlist";
            }
            else {
                messageContext = "track";
            }
            try {
                clipboardy.writeSync(link);
                vscode_1.window.showInformationMessage(`Spotify ${messageContext} link copied to clipboard.`);
            }
            catch (err) {
                console.log(`Unable to copy to clipboard, error: ${err.message}`);
            }
        });
    }
    copyCurrentTrackLink() {
        // example: https://open.spotify.com/track/7fa9MBXhVfQ8P8Df9OEbD8
        // get the current track
        const selectedItem = PlaylistDataManager_1.getSelectedTrackItem();
        this.copySpotifyLink(selectedItem.id, false);
    }
    copyCurrentPlaylistLink() {
        // example: https://open.spotify.com/playlist/0mwG8hCL4scWi8Nkt7jyoV
        const selectedItem = PlaylistDataManager_1.getSelectedTrackItem();
        this.copySpotifyLink(selectedItem["playlist_id"], true);
    }
    shareCurrentPlaylist() {
        const socialShare = SocialShareManager_1.SocialShareManager.getInstance();
        const selectedItem = PlaylistDataManager_1.getSelectedTrackItem();
        const url = buildSpotifyLink(selectedItem["playlist_id"], true);
        socialShare.shareIt("facebook", { u: url, hashtag: "OneOfMyFavs" });
    }
    showMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            let menuOptions = {
                items: [],
            };
            // check if they need to connect to spotify
            const needsSpotifyAccess = PlaylistDataManager_1.requiresSpotifyAccess();
            // check to see if they have the slack access token
            const hasSlackAccess = SlackManager_1.hasSlackWorkspaces();
            menuOptions.items.push({
                label: "Dashboard",
                detail: "View your latest music metrics right here in your editor",
                cb: displayMusicTimeMetricsMarkdownDashboard,
            });
            menuOptions.items.push({
                label: "Submit an issue on GitHub",
                detail: "Encounter a bug? Submit an issue on our GitHub page",
                url: "https://github.com/swdotcom/swdc-vscode-musictime/issues",
            });
            menuOptions.items.push({
                label: "Submit feedback",
                detail: "Send us an email at cody@software.com",
                url: "mailto:cody@software.com",
            });
            menuOptions.items.push({
                label: "More data at Software.com",
                detail: "See music analytics in the web app",
                command: "musictime.launchAnalytics",
            });
            // show divider
            menuOptions.items.push({
                label: "___________________________________________________________________",
                cb: null,
                url: null,
                command: null,
            });
            if (needsSpotifyAccess) {
                menuOptions.items.push({
                    label: "Connect Spotify",
                    detail: "To see your Spotify playlists in Music Time, please connect your account",
                    url: null,
                    cb: SpotifyManager_1.connectSpotify,
                });
            }
            else {
                menuOptions.items.push({
                    label: "Disconnect Spotify",
                    detail: "Disconnect your Spotify oauth integration",
                    url: null,
                    command: "musictime.disconnectSpotify",
                });
                if (!hasSlackAccess) {
                    menuOptions.items.push({
                        label: "Connect Slack",
                        detail: "To share a playlist or track on Slack, please connect your account",
                        url: null,
                        cb: SlackManager_1.connectSlackWorkspace,
                    });
                }
                else {
                    menuOptions.items.push({
                        label: "Disconnect Slack",
                        detail: "Disconnect your Slack oauth integration",
                        url: null,
                        command: "musictime.disconnectSlack",
                    });
                }
            }
            MenuManager_1.showQuickPick(menuOptions);
        });
    }
    showCreatePlaylistInputPrompt(placeHolder) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vscode_1.window.showInputBox({
                value: placeHolder,
                placeHolder: "New Playlist",
                validateInput: (text) => {
                    return !text || text.trim().length === 0 ? "Please enter a playlist name to continue." : null;
                },
            });
        });
    }
    createNewPlaylist() {
        return __awaiter(this, void 0, void 0, function* () {
            const musicControlMgr = MusicControlManager.getInstance();
            // !!! important, need to use the get instance as this
            // method may be called within a callback and "this" will be undefined !!!
            const hasPlaylistItemToAdd = musicControlMgr.currentTrackToAdd ? true : false;
            const placeholder = hasPlaylistItemToAdd
                ? `${musicControlMgr.currentTrackToAdd.artist} - ${musicControlMgr.currentTrackToAdd.name}`
                : "New Playlist";
            let playlistName = yield musicControlMgr.showCreatePlaylistInputPrompt(placeholder);
            if (playlistName && playlistName.trim().length === 0) {
                vscode_1.window.showInformationMessage("Please enter a playlist name to continue.");
                return;
            }
            if (!playlistName) {
                return;
            }
            const playlistItems = hasPlaylistItemToAdd ? [musicControlMgr.currentTrackToAdd] : [];
            MusicPlaylistManager_1.MusicPlaylistManager.getInstance().createPlaylist(playlistName, playlistItems);
        });
    }
    addToPlaylistMenu(playlistItem) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentTrackToAdd = playlistItem;
            let menuOptions = {
                items: [
                    {
                        label: "New Playlist",
                        cb: this.createNewPlaylist,
                    },
                ],
                placeholder: "Select or Create a playlist",
            };
            let playlists = yield PlaylistDataManager_1.getSpotifyPlaylists();
            PlaylistDataManager_1.sortPlaylists(playlists);
            playlists.forEach((item) => {
                menuOptions.items.push({
                    label: item.name,
                    cb: null,
                });
            });
            const pick = yield MenuManager_1.showQuickPick(menuOptions);
            if (pick && pick.label) {
                // add it to this playlist
                const matchingPlaylists = playlists.filter((n) => n.name === pick.label).map((n) => n);
                if (matchingPlaylists.length) {
                    const matchingPlaylist = matchingPlaylists[0];
                    if (matchingPlaylist) {
                        const playlistName = matchingPlaylist.name;
                        let errMsg = null;
                        const trackUri = playlistItem.uri || Util_1.createUriFromTrackId(playlistItem.id);
                        const trackId = playlistItem.id;
                        if (matchingPlaylist.name !== "Liked Songs") {
                            // it's a non-liked songs playlist update
                            // uri:"spotify:track:2JHCaLTVvYjyUrCck0Uvrp" or id
                            const codyResponse = yield cody_music_1.addTracksToPlaylist(matchingPlaylist.id, [trackUri]);
                            errMsg = Util_1.getCodyErrorMessage(codyResponse);
                            // populate the spotify playlists
                            yield PlaylistDataManager_1.getSpotifyPlaylists(true);
                        }
                        else {
                            // it's a liked songs playlist update
                            let track = yield cody_music_1.getRunningTrack();
                            if (track.id !== trackId) {
                                track = new cody_music_1.Track();
                                track.id = playlistItem.id;
                                track.playerType = playlistItem.playerType;
                                track.state = playlistItem.state;
                            }
                            yield this.setLiked(playlistItem, true);
                        }
                        if (!errMsg) {
                            vscode_1.window.showInformationMessage(`Added ${playlistItem.name} to ${playlistName}`);
                            // refresh the playlist and clear the current recommendation metadata
                            PlaylistDataManager_1.removeTracksFromRecommendations(trackId);
                            vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
                        }
                        else {
                            if (errMsg) {
                                vscode_1.window.showErrorMessage(`Failed to add '${playlistItem.name}' to '${playlistName}'. ${errMsg}`, ...[view_constants_1.OK_LABEL]);
                            }
                        }
                    }
                }
            }
        });
    }
}
exports.MusicControlManager = MusicControlManager;
function buildSpotifyLink(id, isPlaylist) {
    let link = "";
    id = Util_1.createSpotifyIdFromUri(id);
    if (isPlaylist) {
        link = `https://open.spotify.com/playlist/${id}`;
    }
    else {
        link = `https://open.spotify.com/track/${id}`;
    }
    return link;
}
exports.buildSpotifyLink = buildSpotifyLink;
function displayMusicTimeMetricsMarkdownDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        const isRegistered = Util_1.checkRegistration();
        if (!isRegistered) {
            return;
        }
        const musicTimeFile = FileManager_1.getMusicTimeMarkdownFile();
        yield FileManager_1.fetchMusicTimeMetricsMarkdownDashboard();
        const viewOptions = {
            viewColumn: vscode_1.ViewColumn.One,
            preserveFocus: false,
        };
        const localResourceRoots = [vscode_1.Uri.file(FileManager_1.getSoftwareDir()), vscode_1.Uri.file(os_1.tmpdir())];
        const panel = vscode_1.window.createWebviewPanel("music-time-preview", `Music Time Dashboard`, viewOptions, {
            enableFindWidget: true,
            localResourceRoots,
            enableScripts: true,
        });
        const content = fileIt.readContentFileSync(musicTimeFile);
        panel.webview.html = content;
    });
}
exports.displayMusicTimeMetricsMarkdownDashboard = displayMusicTimeMetricsMarkdownDashboard;
//# sourceMappingURL=MusicControlManager.js.map
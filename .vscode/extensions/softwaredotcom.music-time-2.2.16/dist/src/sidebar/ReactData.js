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
exports.getReactData = void 0;
const vscode_1 = require("vscode");
const extension_1 = require("../extension");
const FileManager_1 = require("../managers/FileManager");
const PlaylistDataManager_1 = require("../managers/PlaylistDataManager");
const SlackManager_1 = require("../managers/SlackManager");
const SpotifyManager_1 = require("../managers/SpotifyManager");
const Util_1 = require("../Util");
function getReactData(tab_view = undefined, playlist_id = undefined, loading = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = FileManager_1.getItem("name");
        const authType = FileManager_1.getItem("authType");
        const spotifyUser = SpotifyManager_1.getConnectedSpotifyUser();
        const selectedTabView = tab_view ? tab_view : PlaylistDataManager_1.getSelectedTabView();
        let spotifyPlaylists = [];
        let likedSongsTracks = [];
        let playlistTracks = [];
        let softwareTop40Playlist = undefined;
        let selectedPlaylistId = undefined;
        let recommendationInfo = [];
        let userMusicMetrics = [];
        let averageMusicMetrics = undefined;
        let spotifyPlayerContext = undefined;
        let currentlyRunningTrack = undefined;
        let musicScatterData = undefined;
        let deviceMenuInfo = PlaylistDataManager_1.getDeviceMenuInfo();
        if (spotifyUser) {
            spotifyPlayerContext = yield PlaylistDataManager_1.getPlayerContext();
            currentlyRunningTrack = PlaylistDataManager_1.getCachedRunningTrack();
            if (currentlyRunningTrack) {
                currentlyRunningTrack["liked"] = yield PlaylistDataManager_1.isLikedSong(currentlyRunningTrack);
            }
            if (!loading) {
                const data = yield getViewData(selectedTabView, playlist_id, spotifyUser);
                likedSongsTracks = data.likedSongsTracks;
                playlistTracks = data.playlistTracks;
                spotifyPlaylists = data.spotifyPlaylists;
                softwareTop40Playlist = data.softwareTop40Playlist;
                selectedPlaylistId = data.selectedPlaylistId;
                userMusicMetrics = data.userMusicMetrics;
                averageMusicMetrics = data.averageMusicMetrics;
                recommendationInfo = data.recommendationInfo;
                musicScatterData = data.musicScatterData;
            }
        }
        const reactData = {
            authType,
            loading,
            registered: !!name,
            email: name,
            spotifyPlaylists,
            selectedTabView,
            recommendationInfo,
            userMusicMetrics,
            averageMusicMetrics,
            musicScatterData,
            likedSongsTracks,
            playlistTracks,
            softwareTop40Playlist,
            selectedPlaylistId,
            spotifyPlayerContext,
            currentlyRunningTrack,
            deviceMenuInfo,
            likedSongsPlaylist: PlaylistDataManager_1.getSpotifyLikedPlaylist(),
            spotifyUser: SpotifyManager_1.getConnectedSpotifyUser(),
            slackConnected: !!SlackManager_1.hasSlackWorkspaces(),
            slackWorkspaces: SlackManager_1.getSlackWorkspaces(),
            currentColorKind: extension_1.getCurrentColorKind(),
            codeTimeInstalled: Util_1.isCodeTimeTimeInstalled(),
            skipSlackConnect: FileManager_1.getItem("vscode_CtskipSlackConnect"),
        };
        if (loading) {
            const getDataPromise = getViewData(selectedTabView, playlist_id, spotifyUser);
            // call this again with loading as false
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield getDataPromise;
                vscode_1.commands.executeCommand("musictime.refreshMusicTimeView", "playlists");
            }), 2000);
        }
        return reactData;
    });
}
exports.getReactData = getReactData;
function getViewData(selectedTabView, playlist_id, spotifyUser) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let likedSongsTracks = [];
        let playlistTracks = [];
        let spotifyPlaylists = [];
        let softwareTop40Playlist = undefined;
        let selectedPlaylistId = undefined;
        let userMusicMetrics = [];
        let averageMusicMetrics = undefined;
        let recommendationInfo = [];
        let musicScatterData = undefined;
        if (spotifyUser) {
            if (selectedTabView === "playlists") {
                likedSongsTracks = PlaylistDataManager_1.getCachedLikedSongsTracks();
                playlistTracks = PlaylistDataManager_1.getCachedPlaylistTracks();
                const softwareTop40PlaylistP = PlaylistDataManager_1.getCachedSoftwareTop40Playlist();
                const spotifyPlaylistsP = PlaylistDataManager_1.getCachedSpotifyPlaylists();
                softwareTop40Playlist = yield softwareTop40PlaylistP;
                spotifyPlaylists = yield spotifyPlaylistsP;
                selectedPlaylistId = playlist_id ? playlist_id : PlaylistDataManager_1.getSelectedPlaylistId();
            }
            else if (selectedTabView === "metrics") {
                const metricsData = yield PlaylistDataManager_1.getCachedUserMetricsData();
                userMusicMetrics = (_a = metricsData.userMusicMetrics) !== null && _a !== void 0 ? _a : [];
                averageMusicMetrics = (_b = metricsData.averageMusicMetrics) !== null && _b !== void 0 ? _b : [];
                musicScatterData = metricsData.musicScatterData;
            }
            else if (selectedTabView === "recommendations") {
                recommendationInfo = PlaylistDataManager_1.getCachedRecommendationInfo();
            }
        }
        return {
            likedSongsTracks,
            playlistTracks,
            spotifyPlaylists,
            softwareTop40Playlist,
            selectedPlaylistId,
            userMusicMetrics,
            musicScatterData,
            averageMusicMetrics,
            recommendationInfo,
        };
    });
}
//# sourceMappingURL=ReactData.js.map
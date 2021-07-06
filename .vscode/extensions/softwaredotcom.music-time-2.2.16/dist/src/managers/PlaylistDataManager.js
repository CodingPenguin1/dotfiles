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
exports.sortPlaylists = exports.createPlaylistItemFromTrack = exports.createSpotifyIdFromUri = exports.isLikedSong = exports.followSpotifyPlaylist = exports.removeTrackFromPlaylist = exports.isTrackRepeating = exports.initializeSpotify = exports.requiresSpotifyAccess = exports.populatePlayerContext = exports.getBestActiveDevice = exports.getDeviceMenuInfo = exports.getDeviceSet = exports.showReconnectPrompt = exports.requiresSpotifyReAuthentication = exports.getCurrentDevices = exports.populateSpotifyDevices = exports.removeTracksFromRecommendations = exports.populateRecommendationTracks = exports.getRecommendations = exports.refreshRecommendations = exports.getAlbumForTrack = exports.getTrackRecommendations = exports.getMixedAudioFeatureRecs = exports.getQuietMusicRecs = exports.getInstrumentalRecs = exports.getDanceableRecs = exports.getEnergeticRecs = exports.getHappyRecs = exports.getFamiliarRecs = exports.getCurrentRecommendations = exports.populateLikedSongs = exports.getUserMusicMetrics = exports.fetchTracksForPlaylist = exports.fetchTracksForLikedSongs = exports.getSoftwareTop40Playlist = exports.getSpotifyLikedPlaylist = exports.getSpotifyPlaylists = exports.getRecommendationURIsFromTrackId = exports.getLikedURIsFromTrackId = exports.isLikedSongPlaylistSelected = exports.getPlaylistById = exports.getSelectedTabView = exports.getSelectedTrackItem = exports.getSelectedPlayerName = exports.getSelectedPlaylistId = exports.getCachedRunningTrack = exports.getPlayerContext = exports.getCachedRecommendationMetadata = exports.getCachedUserMetricsData = exports.getCachedRecommendationInfo = exports.getCachedSoftwareTop40Playlist = exports.getCachedLikedSongsTracks = exports.getCachedPlaylistTracks = exports.getCachedSpotifyPlaylists = exports.updateLikedStatusInPlaylist = exports.updateCachedRunningTrack = exports.updateSort = exports.updateSelectedTabView = exports.updateSelectedPlayer = exports.updateSelectedPlaylistId = exports.updateSelectedTrackItem = exports.updateSpotifyPlaylistTracks = exports.addTrackToLikedPlaylist = exports.removeTrackFromLikedPlaylist = exports.updateSpotifyLikedTracks = exports.updateSpotifyPlaylists = exports.clearSpotifyPlayerContext = exports.clearSpotifyDevicesCache = exports.clearSpotifyPlaylistsCache = exports.clearSpotifyLikedTracksCache = exports.clearAllData = void 0;
const cody_music_1 = require("cody-music");
const vscode_1 = require("vscode");
const view_constants_1 = require("../app/utils/view_constants");
const view_constants_2 = require("../app/utils/view_constants");
const HttpClient_1 = require("../HttpClient");
const MusicMetrics_1 = require("../model/MusicMetrics");
const MusicScatterData_1 = require("../model/MusicScatterData");
const MusicCommandManager_1 = require("../music/MusicCommandManager");
const MusicCommandUtil_1 = require("../music/MusicCommandUtil");
const MusicControlManager_1 = require("../music/MusicControlManager");
const MusicStateManager_1 = require("../music/MusicStateManager");
const Util_1 = require("../Util");
const FileManager_1 = require("./FileManager");
const SpotifyManager_1 = require("./SpotifyManager");
let currentDevices = [];
let spotifyLikedTracks = undefined;
let spotifyPlaylists = undefined;
let softwareTop40Playlist = undefined;
let recommendedTracks = undefined;
let playlistTracks = {};
let musicScatterData = undefined;
let userMusicMetrics = undefined;
let globalMusicMetrics = undefined;
let averageMusicMetrics = undefined;
let selectedPlaylistId = undefined;
let selectedTrackItem = undefined;
let cachedRunningTrack = undefined;
let spotifyContext = undefined;
let selectedPlayerName = cody_music_1.PlayerName.SpotifyWeb;
// playlists, recommendations, metrics
let selectedTabView = "playlists";
let recommendationMetadata = undefined;
let recommendationInfo = undefined;
let sortAlphabetically = false;
////////////////////////////////////////////////////////////////
// CLEAR DATA EXPORTS
////////////////////////////////////////////////////////////////
function clearAllData() {
    clearSpotifyLikedTracksCache();
    clearSpotifyPlaylistsCache();
    clearSpotifyDevicesCache();
    selectedPlaylistId = undefined;
    selectedTrackItem = undefined;
}
exports.clearAllData = clearAllData;
function clearSpotifyLikedTracksCache() {
    spotifyLikedTracks = undefined;
}
exports.clearSpotifyLikedTracksCache = clearSpotifyLikedTracksCache;
function clearSpotifyPlaylistsCache() {
    spotifyPlaylists = undefined;
}
exports.clearSpotifyPlaylistsCache = clearSpotifyPlaylistsCache;
function clearSpotifyDevicesCache() {
    currentDevices = undefined;
}
exports.clearSpotifyDevicesCache = clearSpotifyDevicesCache;
function clearSpotifyPlayerContext() {
    spotifyContext = null;
}
exports.clearSpotifyPlayerContext = clearSpotifyPlayerContext;
////////////////////////////////////////////////////////////////
// UPDATE EXPORTS
////////////////////////////////////////////////////////////////
function updateSpotifyPlaylists(playlists) {
    spotifyPlaylists = playlists;
}
exports.updateSpotifyPlaylists = updateSpotifyPlaylists;
function updateSpotifyLikedTracks(songs) {
    spotifyLikedTracks = songs;
}
exports.updateSpotifyLikedTracks = updateSpotifyLikedTracks;
function removeTrackFromLikedPlaylist(trackId) {
    spotifyLikedTracks = spotifyLikedTracks.filter((n) => n.id !== trackId);
}
exports.removeTrackFromLikedPlaylist = removeTrackFromLikedPlaylist;
function addTrackToLikedPlaylist(playlistItem) {
    playlistItem["liked"] = true;
    playlistItem["playlist_id"] = view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_ID;
    spotifyLikedTracks.unshift(playlistItem);
}
exports.addTrackToLikedPlaylist = addTrackToLikedPlaylist;
function updateSpotifyPlaylistTracks(playlist_id, songs) {
    playlistTracks[playlist_id] = songs;
}
exports.updateSpotifyPlaylistTracks = updateSpotifyPlaylistTracks;
function updateSelectedTrackItem(item) {
    selectedTrackItem = item;
    selectedPlaylistId = item["playlist_id"];
}
exports.updateSelectedTrackItem = updateSelectedTrackItem;
function updateSelectedPlaylistId(playlist_id) {
    selectedPlaylistId = playlist_id;
}
exports.updateSelectedPlaylistId = updateSelectedPlaylistId;
function updateSelectedPlayer(player) {
    selectedPlayerName = player;
}
exports.updateSelectedPlayer = updateSelectedPlayer;
function updateSelectedTabView(tabView) {
    selectedTabView = tabView;
}
exports.updateSelectedTabView = updateSelectedTabView;
function updateSort(alphabetically) {
    sortAlphabetically = alphabetically;
    sortPlaylists(spotifyPlaylists, alphabetically);
    vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
}
exports.updateSort = updateSort;
function updateCachedRunningTrack(track) {
    cachedRunningTrack = track;
    // track has been updated, refresh the webview
    vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
}
exports.updateCachedRunningTrack = updateCachedRunningTrack;
function updateLikedStatusInPlaylist(playlist_id, track_id, liked_state) {
    var _a, _b;
    let item = ((_a = playlistTracks[playlist_id]) === null || _a === void 0 ? void 0 : _a.length) ? playlistTracks[playlist_id].find((n) => n.id === track_id) : null;
    if (item) {
        item["liked"] = liked_state;
    }
    // it might be in the recommendations list
    item = (_b = recommendationInfo.tracks) === null || _b === void 0 ? void 0 : _b.find((n) => n.id === track_id);
    if (item) {
        item["liked"] = liked_state;
    }
}
exports.updateLikedStatusInPlaylist = updateLikedStatusInPlaylist;
////////////////////////////////////////////////////////////////
// CACHE GETTERS
////////////////////////////////////////////////////////////////
function getCachedSpotifyPlaylists() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!spotifyPlaylists) {
            spotifyPlaylists = yield getSpotifyPlaylists();
        }
        return spotifyPlaylists;
    });
}
exports.getCachedSpotifyPlaylists = getCachedSpotifyPlaylists;
function getCachedPlaylistTracks() {
    return playlistTracks;
}
exports.getCachedPlaylistTracks = getCachedPlaylistTracks;
function getCachedLikedSongsTracks() {
    return spotifyLikedTracks;
}
exports.getCachedLikedSongsTracks = getCachedLikedSongsTracks;
function getCachedSoftwareTop40Playlist() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!softwareTop40Playlist) {
            softwareTop40Playlist = yield getSoftwareTop40Playlist();
        }
        return softwareTop40Playlist;
    });
}
exports.getCachedSoftwareTop40Playlist = getCachedSoftwareTop40Playlist;
function getCachedRecommendationInfo() {
    return recommendationInfo;
}
exports.getCachedRecommendationInfo = getCachedRecommendationInfo;
function getCachedUserMetricsData() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userMusicMetrics) {
            yield getUserMusicMetrics();
        }
        return { userMusicMetrics, averageMusicMetrics, musicScatterData };
    });
}
exports.getCachedUserMetricsData = getCachedUserMetricsData;
function getCachedRecommendationMetadata() {
    return recommendationMetadata;
}
exports.getCachedRecommendationMetadata = getCachedRecommendationMetadata;
function getPlayerContext() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield cody_music_1.getSpotifyPlayerContext();
    });
}
exports.getPlayerContext = getPlayerContext;
function getCachedRunningTrack() {
    return cachedRunningTrack;
}
exports.getCachedRunningTrack = getCachedRunningTrack;
function getSelectedPlaylistId() {
    return selectedPlaylistId;
}
exports.getSelectedPlaylistId = getSelectedPlaylistId;
function getSelectedPlayerName() {
    return selectedPlayerName;
}
exports.getSelectedPlayerName = getSelectedPlayerName;
function getSelectedTrackItem() {
    return selectedTrackItem;
}
exports.getSelectedTrackItem = getSelectedTrackItem;
function getSelectedTabView() {
    return selectedTabView;
}
exports.getSelectedTabView = getSelectedTabView;
// only playlists (not liked or recommendations)
function getPlaylistById(playlist_id) {
    if (view_constants_1.SOFTWARE_TOP_40_PLAYLIST_ID === playlist_id) {
        return softwareTop40Playlist;
    }
    return spotifyPlaylists === null || spotifyPlaylists === void 0 ? void 0 : spotifyPlaylists.find((n) => n.id === playlist_id);
}
exports.getPlaylistById = getPlaylistById;
function isLikedSongPlaylistSelected() {
    return !!(selectedPlaylistId === view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_ID);
}
exports.isLikedSongPlaylistSelected = isLikedSongPlaylistSelected;
function getLikedURIsFromTrackId(trackId) {
    return getTracksFromTrackId(trackId, spotifyLikedTracks);
}
exports.getLikedURIsFromTrackId = getLikedURIsFromTrackId;
function getRecommendationURIsFromTrackId(trackId) {
    return getTracksFromTrackId(trackId, recommendationInfo === null || recommendationInfo === void 0 ? void 0 : recommendationInfo.tracks);
}
exports.getRecommendationURIsFromTrackId = getRecommendationURIsFromTrackId;
function createUriFromTrackId(track_id) {
    if (track_id && !track_id.includes("spotify:track:")) {
        track_id = `spotify:track:${track_id}`;
    }
    return track_id;
}
function getTracksFromTrackId(trackId, existingTracks) {
    let uris = [];
    let foundTrack = false;
    if (existingTracks === null || existingTracks === void 0 ? void 0 : existingTracks.length) {
        for (const track of existingTracks) {
            if (!foundTrack && track.id === trackId) {
                foundTrack = true;
            }
            if (foundTrack) {
                uris.push(createUriFromTrackId(track.id));
            }
        }
    }
    if ((existingTracks === null || existingTracks === void 0 ? void 0 : existingTracks.length) && uris.length < 10) {
        const limit = 10;
        // add the ones to the beginning until we've reached 10 or the found track
        let idx = 0;
        for (const track of existingTracks) {
            if (idx >= 10 || (!foundTrack && track.id === trackId)) {
                break;
            }
            uris.push(createUriFromTrackId(track.id));
            idx++;
        }
    }
    return uris;
}
////////////////////////////////////////////////////////////////
// PLAYLIST AND TRACK EXPORTS
////////////////////////////////////////////////////////////////
// PLAYLISTS
function getSpotifyPlaylists(clear = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (requiresSpotifyAccess()) {
            return [];
        }
        if (!clear && spotifyPlaylists) {
            return spotifyPlaylists;
        }
        spotifyPlaylists = yield cody_music_1.getPlaylists(cody_music_1.PlayerName.SpotifyWeb, { all: true });
        spotifyPlaylists = spotifyPlaylists === null || spotifyPlaylists === void 0 ? void 0 : spotifyPlaylists.map((n, index) => {
            return Object.assign(Object.assign({}, n), { index });
        });
        return spotifyPlaylists;
    });
}
exports.getSpotifyPlaylists = getSpotifyPlaylists;
// LIKED SONGS
function getSpotifyLikedPlaylist() {
    const item = new cody_music_1.PlaylistItem();
    item.type = "playlist";
    item.id = view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_ID;
    item.tracks = new cody_music_1.PlaylistTrackInfo();
    // set set a number so it shows up
    item.tracks.total = 1;
    item.playerType = cody_music_1.PlayerType.WebSpotify;
    item.tag = "spotify-liked-songs";
    item.itemType = "playlist";
    item.name = view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_NAME;
    return item;
}
exports.getSpotifyLikedPlaylist = getSpotifyLikedPlaylist;
// SOFTWARE TOP 40
function getSoftwareTop40Playlist() {
    return __awaiter(this, void 0, void 0, function* () {
        softwareTop40Playlist = yield cody_music_1.getSpotifyPlaylist(view_constants_1.SOFTWARE_TOP_40_PLAYLIST_ID);
        if (softwareTop40Playlist && softwareTop40Playlist.tracks && softwareTop40Playlist.tracks["items"]) {
            softwareTop40Playlist.tracks["items"] = softwareTop40Playlist.tracks["items"].map((n) => {
                const albumName = getAlbumName(n.track);
                const description = getArtistAlbumDescription(n.track);
                n.track = Object.assign(Object.assign({}, n.track), { albumName, description, playlist_id: view_constants_1.SOFTWARE_TOP_40_PLAYLIST_ID });
                return Object.assign({}, n);
            });
        }
        return softwareTop40Playlist;
    });
}
exports.getSoftwareTop40Playlist = getSoftwareTop40Playlist;
// LIKED PLAYLIST TRACKS
function fetchTracksForLikedSongs() {
    return __awaiter(this, void 0, void 0, function* () {
        selectedPlaylistId = view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_ID;
        if (!spotifyLikedTracks) {
            yield populateLikedSongs();
        }
        // refresh the webview
        vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
    });
}
exports.fetchTracksForLikedSongs = fetchTracksForLikedSongs;
// TRACKS FOR A SPECIFIED PLAYLIST
function fetchTracksForPlaylist(playlist_id) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        updateSelectedPlaylistId(playlist_id);
        if (!playlistTracks[playlist_id]) {
            const results = yield cody_music_1.getPlaylistTracks(cody_music_1.PlayerName.SpotifyWeb, playlist_id);
            let tracks = yield getPlaylistItemTracksFromCodyResponse(results);
            // add the playlist id to the tracks
            if (tracks === null || tracks === void 0 ? void 0 : tracks.length) {
                try {
                    for (var tracks_1 = __asyncValues(tracks), tracks_1_1; tracks_1_1 = yield tracks_1.next(), !tracks_1_1.done;) {
                        const t = tracks_1_1.value;
                        const albumName = getAlbumName(t);
                        const description = getArtistAlbumDescription(t);
                        t["playlist_id"] = playlist_id;
                        t["albumName"] = albumName;
                        t["description"] = description;
                        t["liked"] = yield isLikedSong(t);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (tracks_1_1 && !tracks_1_1.done && (_a = tracks_1.return)) yield _a.call(tracks_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            playlistTracks[playlist_id] = tracks;
        }
        // refresh the webview
        vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
    });
}
exports.fetchTracksForPlaylist = fetchTracksForPlaylist;
////////////////////////////////////////////////////////////////
// METRICS EXPORTS
////////////////////////////////////////////////////////////////
function getUserMusicMetrics() {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield HttpClient_1.softwareGet("/music/metrics", FileManager_1.getItem("jwt"));
        if (HttpClient_1.isResponseOk(resp) && resp.data) {
            userMusicMetrics = resp.data.user_music_metrics;
            if (userMusicMetrics) {
                averageMusicMetrics = new MusicMetrics_1.default();
                musicScatterData = new MusicScatterData_1.default();
                userMusicMetrics = userMusicMetrics.map((n, index) => {
                    n["keystrokes"] = n.keystrokes ? Math.ceil(n.keystrokes) : 0;
                    n["keystrokes_formatted"] = new Intl.NumberFormat().format(n.keystrokes);
                    n["id"] = n.song_id;
                    n["trackId"] = n.song_id;
                    averageMusicMetrics.increment(n);
                    musicScatterData.addMetric(n);
                    return n;
                });
                averageMusicMetrics.setAverages(userMusicMetrics.length);
                userMusicMetrics = userMusicMetrics.filter((n) => n.song_name);
            }
        }
    });
}
exports.getUserMusicMetrics = getUserMusicMetrics;
function populateLikedSongs() {
    return __awaiter(this, void 0, void 0, function* () {
        const tracks = (yield cody_music_1.getSpotifyLikedSongs()) || [];
        // add the playlist id to the tracks
        if (tracks === null || tracks === void 0 ? void 0 : tracks.length) {
            spotifyLikedTracks = tracks.map((t, idx) => {
                const playlistItem = createPlaylistItemFromTrack(t, idx);
                playlistItem["playlist_id"] = view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_ID;
                playlistItem["liked"] = true;
                return playlistItem;
            });
        }
    });
}
exports.populateLikedSongs = populateLikedSongs;
////////////////////////////////////////////////////////////////
// RECOMMENDATION TRACKS EXPORTS
////////////////////////////////////////////////////////////////
function getCurrentRecommendations() {
    if (recommendationMetadata) {
        getRecommendations(recommendationMetadata.length, recommendationMetadata.seedLimit, recommendationMetadata.seed_genres, recommendationMetadata.features, 0);
    }
    else {
        getFamiliarRecs();
    }
}
exports.getCurrentRecommendations = getCurrentRecommendations;
function getFamiliarRecs() {
    return getRecommendations("Familiar", 5);
}
exports.getFamiliarRecs = getFamiliarRecs;
function getHappyRecs() {
    return getRecommendations("Happy", 5, [], { min_valence: 0.7, target_valence: 1 });
}
exports.getHappyRecs = getHappyRecs;
function getEnergeticRecs() {
    return getRecommendations("Energetic", 5, [], { min_energy: 0.7, target_energy: 1 });
}
exports.getEnergeticRecs = getEnergeticRecs;
function getDanceableRecs() {
    return getRecommendations("Danceable", 5, [], { min_danceability: 0.5, target_danceability: 1 });
}
exports.getDanceableRecs = getDanceableRecs;
function getInstrumentalRecs() {
    return getRecommendations("Instrumental", 5, [], { min_instrumentalness: 0.6, target_instrumentalness: 1 });
}
exports.getInstrumentalRecs = getInstrumentalRecs;
function getQuietMusicRecs() {
    return getRecommendations("Quiet music", 5, [], { max_loudness: -10, target_loudness: -50 });
}
exports.getQuietMusicRecs = getQuietMusicRecs;
function getMixedAudioFeatureRecs(features) {
    if (!features) {
        // fetch familiar
        getFamiliarRecs();
        return;
    }
    return getRecommendations("Audio mix", 5, [], features);
}
exports.getMixedAudioFeatureRecs = getMixedAudioFeatureRecs;
function getTrackRecommendations(playlistItem) {
    return getRecommendations(playlistItem.name, 4, [], {}, 0, [playlistItem]);
}
exports.getTrackRecommendations = getTrackRecommendations;
function getAlbumForTrack(playlistItem) {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let albumId = playlistItem["albumId"];
        let albumName = playlistItem["album"] ? playlistItem["album"]["name"] : "";
        if (!albumId && playlistItem["album"]) {
            albumId = playlistItem["album"]["id"];
        }
        if (albumId) {
            const albumTracks = yield cody_music_1.getSpotifyAlbumTracks(albumId);
            let items = [];
            if (albumTracks === null || albumTracks === void 0 ? void 0 : albumTracks.length) {
                let idx = 1;
                try {
                    for (var albumTracks_1 = __asyncValues(albumTracks), albumTracks_1_1; albumTracks_1_1 = yield albumTracks_1.next(), !albumTracks_1_1.done;) {
                        const t = albumTracks_1_1.value;
                        const playlistItem = createPlaylistItemFromTrack(t, idx);
                        if (!t["albumName"]) {
                            t["albumName"] = albumName;
                        }
                        playlistItem["liked"] = yield isLikedSong(t);
                        idx++;
                        items.push(playlistItem);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (albumTracks_1_1 && !albumTracks_1_1.done && (_a = albumTracks_1.return)) yield _a.call(albumTracks_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            populateRecommendationTracks(playlistItem["albumName"], items);
        }
    });
}
exports.getAlbumForTrack = getAlbumForTrack;
function refreshRecommendations() {
    if (!recommendationInfo) {
        return getFamiliarRecs();
    }
    else {
        let offset = (recommendationMetadata.offset += 5);
        if (offset.length - 5 < offset) {
            // start back at the beginning
            offset = 0;
        }
        getRecommendations(recommendationMetadata.label, recommendationMetadata.seedLimit, recommendationMetadata.seed_genres, recommendationMetadata.features, offset);
    }
}
exports.refreshRecommendations = refreshRecommendations;
function getRecommendations(label, seedLimit = 5, seed_genres = [], features = {}, offset = 0, seedTracks = []) {
    return __awaiter(this, void 0, void 0, function* () {
        // set the selectedTabView to "recommendations"
        selectedTabView = "recommendations";
        // fetching recommendations based on a set of genre requires 0 seed track IDs
        seedLimit = seed_genres.length ? 0 : Math.max(seedLimit, 5);
        recommendationMetadata = {
            label,
            seedLimit,
            seed_genres,
            features,
            offset,
        };
        recommendedTracks = yield getTrackIdsForRecommendations(seedLimit, seedTracks, offset).then((trackIds) => __awaiter(this, void 0, void 0, function* () {
            var e_3, _a;
            const tracks = yield cody_music_1.getRecommendationsForTracks(trackIds, view_constants_1.RECOMMENDATION_LIMIT, "" /*market*/, 20, 100, seed_genres, [] /*artists*/, features);
            let items = [];
            if (tracks === null || tracks === void 0 ? void 0 : tracks.length) {
                let idx = 1;
                try {
                    for (var tracks_2 = __asyncValues(tracks), tracks_2_1; tracks_2_1 = yield tracks_2.next(), !tracks_2_1.done;) {
                        const t = tracks_2_1.value;
                        const playlistItem = createPlaylistItemFromTrack(t, idx);
                        playlistItem["playlist_id"] = view_constants_1.RECOMMENDATION_PLAYLIST_ID;
                        playlistItem["liked"] = yield isLikedSong(t);
                        items.push(playlistItem);
                        idx++;
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (tracks_2_1 && !tracks_2_1.done && (_a = tracks_2.return)) yield _a.call(tracks_2);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            return items;
        }));
        populateRecommendationTracks(label, recommendedTracks);
    });
}
exports.getRecommendations = getRecommendations;
function populateRecommendationTracks(label, tracks) {
    if (tracks === null || tracks === void 0 ? void 0 : tracks.length) {
        tracks = tracks.map((t) => {
            t["playlist_id"] = view_constants_1.RECOMMENDATION_PLAYLIST_ID;
            const albumName = getAlbumName(t);
            const description = getArtistAlbumDescription(t);
            return Object.assign(Object.assign({}, t), { albumName, description });
        });
    }
    recommendationInfo = {
        label,
        tracks,
    };
    // refresh the webview
    vscode_1.commands.executeCommand("musictime.refreshMusicTimeView", "recommendations");
}
exports.populateRecommendationTracks = populateRecommendationTracks;
function removeTracksFromRecommendations(trackId) {
    let foundIdx = -1;
    for (let i = 0; i < recommendationInfo.tracks.length; i++) {
        if (recommendationInfo.tracks[i].id === trackId) {
            foundIdx = i;
            break;
        }
    }
    if (foundIdx > -1) {
        // splice it out
        recommendationInfo.tracks.splice(foundIdx, 1);
    }
    if (recommendationInfo.tracks.length < 2) {
        // refresh
        vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
    }
}
exports.removeTracksFromRecommendations = removeTracksFromRecommendations;
////////////////////////////////////////////////////////////////
// DEVICE EXPORTS
////////////////////////////////////////////////////////////////
// POPULATE
function populateSpotifyDevices(tryAgain = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const devices = yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.getSpotifyDevices);
        if (devices.status && devices.status === 429 && tryAgain) {
            // try one more time in lazily since its not a device launch request.
            // the device launch requests retries a few times every couple seconds.
            setTimeout(() => {
                // use true to specify its a device launch so this doens't try continuously
                populateSpotifyDevices(false);
            }, 5000);
            return;
        }
        const fetchedDeviceIds = [];
        if (devices.length) {
            devices.forEach((el) => {
                fetchedDeviceIds.push(el.id);
            });
        }
        let diffDevices = [];
        if (currentDevices.length) {
            // get any differences from the fetched devices if any
            diffDevices = currentDevices.filter((n) => !fetchedDeviceIds.includes(n.id));
        }
        else if (fetchedDeviceIds.length) {
            // no current devices, set diff to whatever we fetched
            diffDevices = [...devices];
        }
        if (diffDevices.length || currentDevices.length !== diffDevices.length) {
            // new devices available or setting to empty
            currentDevices = devices;
            setTimeout(() => {
                MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
            }, 3000);
        }
    });
}
exports.populateSpotifyDevices = populateSpotifyDevices;
function getCurrentDevices() {
    return currentDevices;
}
exports.getCurrentDevices = getCurrentDevices;
function requiresSpotifyReAuthentication() {
    const requiresSpotifyReAuth = FileManager_1.getItem("requiresSpotifyReAuth");
    return requiresSpotifyReAuth ? true : false;
}
exports.requiresSpotifyReAuthentication = requiresSpotifyReAuthentication;
function showReconnectPrompt(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const reconnectButtonLabel = "Reconnect";
        const msg = `To continue using Music Time, please reconnect your Spotify account (${email}).`;
        const selection = yield vscode_1.window.showInformationMessage(msg, ...[reconnectButtonLabel]);
        if (selection === reconnectButtonLabel) {
            // now launch re-auth
            yield SpotifyManager_1.connectSpotify();
        }
    });
}
exports.showReconnectPrompt = showReconnectPrompt;
/**
 * returns { webPlayer, desktop, activeDevice, activeComputerDevice, activeWebPlayerDevice }
 * Either of these values can be null
 */
function getDeviceSet() {
    const webPlayer = currentDevices === null || currentDevices === void 0 ? void 0 : currentDevices.find((d) => d.name.toLowerCase().includes("web player"));
    const desktop = currentDevices === null || currentDevices === void 0 ? void 0 : currentDevices.find((d) => d.type.toLowerCase() === "computer" && !d.name.toLowerCase().includes("web player"));
    const activeDevice = currentDevices === null || currentDevices === void 0 ? void 0 : currentDevices.find((d) => d.is_active);
    const activeComputerDevice = currentDevices === null || currentDevices === void 0 ? void 0 : currentDevices.find((d) => d.is_active && d.type.toLowerCase() === "computer");
    const activeWebPlayerDevice = currentDevices === null || currentDevices === void 0 ? void 0 : currentDevices.find((d) => d.is_active && d.type.toLowerCase() === "computer" && d.name.toLowerCase().includes("web player"));
    const activeDesktopPlayerDevice = currentDevices === null || currentDevices === void 0 ? void 0 : currentDevices.find((d) => d.is_active && d.type.toLowerCase() === "computer" && !d.name.toLowerCase().includes("web player"));
    const deviceData = {
        webPlayer,
        desktop,
        activeDevice,
        activeComputerDevice,
        activeWebPlayerDevice,
        activeDesktopPlayerDevice,
    };
    return deviceData;
}
exports.getDeviceSet = getDeviceSet;
function getDeviceMenuInfo() {
    const { webPlayer, desktop, activeDevice, activeComputerDevice, activeWebPlayerDevice } = getDeviceSet();
    const devices = getCurrentDevices();
    let primaryText = "";
    let secondaryText = "";
    let isActive = true;
    if (activeDevice) {
        // found an active device
        primaryText = `Listening on your ${activeDevice.name}`;
    }
    else if (Util_1.isMac() && desktop) {
        // show that the desktop player is an active device
        primaryText = `Listening on your ${desktop.name}`;
    }
    else if (webPlayer) {
        // show that the web player is an active device
        primaryText = `Listening on your ${webPlayer.name}`;
    }
    else if (desktop) {
        // show that the desktop player is an active device
        primaryText = `Listening on your ${desktop.name}`;
    }
    else if (devices.length) {
        // no active device but found devices
        const names = devices.map((d) => d.name);
        primaryText = `Spotify devices available`;
        secondaryText = `${names.join(", ")}`;
        isActive = false;
    }
    else if (devices.length === 0) {
        // no active device and no devices
        primaryText = "Connect to a Spotify device";
        secondaryText = "Launch the web or desktop player";
        isActive = false;
    }
    return { primaryText, secondaryText, isActive };
}
exports.getDeviceMenuInfo = getDeviceMenuInfo;
function getBestActiveDevice() {
    const { webPlayer, desktop, activeDevice } = getDeviceSet();
    const device = activeDevice ? activeDevice : desktop ? desktop : webPlayer ? webPlayer : null;
    return device;
}
exports.getBestActiveDevice = getBestActiveDevice;
////////////////////////////////////////////////////////////////
// PLAYER CONTEXT FUNCTIONS
////////////////////////////////////////////////////////////////
function populatePlayerContext() {
    return __awaiter(this, void 0, void 0, function* () {
        spotifyContext = yield cody_music_1.getSpotifyPlayerContext();
        MusicCommandManager_1.MusicCommandManager.syncControls(cachedRunningTrack, false);
    });
}
exports.populatePlayerContext = populatePlayerContext;
////////////////////////////////////////////////////////////////
// UTIL FUNCTIONS
////////////////////////////////////////////////////////////////
function requiresSpotifyAccess() {
    const spotifyIntegration = SpotifyManager_1.getSpotifyIntegration();
    // no spotify access token then return true, the user requires spotify access
    return !spotifyIntegration ? true : false;
}
exports.requiresSpotifyAccess = requiresSpotifyAccess;
function initializeSpotify(refreshUser = false) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the client id and secret
        yield SpotifyManager_1.updateSpotifyClientInfo();
        // update cody music with all access info
        SpotifyManager_1.updateCodyConfig();
        // first get the spotify user
        yield SpotifyManager_1.populateSpotifyUser(refreshUser);
        yield populateSpotifyDevices(false);
        // initialize the status bar music controls
        MusicCommandManager_1.MusicCommandManager.initialize();
    });
}
exports.initializeSpotify = initializeSpotify;
function isTrackRepeating() {
    return __awaiter(this, void 0, void 0, function* () {
        // get the current repeat state
        if (!spotifyContext) {
            spotifyContext = yield cody_music_1.getSpotifyPlayerContext();
        }
        // "off", "track", "context", ""
        const repeatState = spotifyContext ? spotifyContext.repeat_state : "";
        return repeatState && repeatState === "track" ? true : false;
    });
}
exports.isTrackRepeating = isTrackRepeating;
function removeTrackFromPlaylist(trackItem) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the playlist it's in
        const currentPlaylistId = trackItem["playlist_id"];
        const foundPlaylist = getPlaylistById(currentPlaylistId);
        if (foundPlaylist) {
            // if it's the liked songs, then send it to the setLiked(false) api
            if (foundPlaylist.id === view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_NAME) {
                const buttonSelection = yield vscode_1.window.showInformationMessage(`Are you sure you would like to remove '${trackItem.name}' from your '${view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_NAME}' playlist?`, ...[view_constants_2.YES_LABEL]);
                if (buttonSelection === view_constants_2.YES_LABEL) {
                    yield MusicControlManager_1.MusicControlManager.getInstance().setLiked(trackItem, false);
                }
            }
            else {
                // remove it from a playlist
                const tracks = [trackItem.id];
                const result = yield cody_music_1.removeTracksFromPlaylist(currentPlaylistId, tracks);
                const errMsg = Util_1.getCodyErrorMessage(result);
                if (errMsg) {
                    vscode_1.window.showInformationMessage(`Unable to remove the track from your playlist. ${errMsg}`);
                }
                else {
                    // remove it from the cached list
                    playlistTracks[currentPlaylistId] = playlistTracks[currentPlaylistId].filter((n) => n.id !== trackItem.id);
                    vscode_1.window.showInformationMessage("Song removed successfully");
                    vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
                }
            }
        }
    });
}
exports.removeTrackFromPlaylist = removeTrackFromPlaylist;
function followSpotifyPlaylist(playlist) {
    return __awaiter(this, void 0, void 0, function* () {
        const codyResp = yield cody_music_1.followPlaylist(playlist.id);
        if (codyResp.state === cody_music_1.CodyResponseType.Success) {
            vscode_1.window.showInformationMessage(`Successfully following the '${playlist.name}' playlist.`);
            // repopulate the playlists since we've changed the state of the playlist
            yield getSpotifyPlaylists();
            vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
        }
        else {
            vscode_1.window.showInformationMessage(`Unable to follow ${playlist.name}. ${codyResp.message}`, ...[view_constants_2.OK_LABEL]);
        }
    });
}
exports.followSpotifyPlaylist = followSpotifyPlaylist;
function isLikedSong(song) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!song) {
            return false;
        }
        const trackId = getSongId(song);
        if (!trackId) {
            return false;
        }
        if (!spotifyLikedTracks || spotifyLikedTracks.length === 0) {
            // fetch the liked tracks
            yield populateLikedSongs();
        }
        const foundSong = !!(spotifyLikedTracks === null || spotifyLikedTracks === void 0 ? void 0 : spotifyLikedTracks.find((n) => n.id === trackId));
        return foundSong;
    });
}
exports.isLikedSong = isLikedSong;
////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
////////////////////////////////////////////////////////////////
function getSongId(song) {
    if (song.id) {
        return createSpotifyIdFromUri(song.id);
    }
    else if (song.uri) {
        return createSpotifyIdFromUri(song.uri);
    }
    else if (song.song_id) {
        return createSpotifyIdFromUri(song.song_id);
    }
    return null;
}
function createSpotifyIdFromUri(id) {
    if (id && id.indexOf("spotify:") === 0) {
        return id.substring(id.lastIndexOf(":") + 1);
    }
    return id;
}
exports.createSpotifyIdFromUri = createSpotifyIdFromUri;
function getPlaylistItemTracksFromCodyResponse(codyResponse) {
    var e_4, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let playlistItems = [];
        if (codyResponse && codyResponse.state === cody_music_1.CodyResponseType.Success) {
            let paginationItem = codyResponse.data;
            if (paginationItem && paginationItem.items) {
                let idx = 1;
                try {
                    for (var _b = __asyncValues(paginationItem.items), _c; _c = yield _b.next(), !_c.done;) {
                        const t = _c.value;
                        const playlistItem = createPlaylistItemFromTrack(t, idx);
                        playlistItem["liked"] = yield isLikedSong(t);
                        playlistItems.push(playlistItem);
                        idx++;
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        return playlistItems;
    });
}
function createPlaylistItemFromTrack(track, position = undefined) {
    var _a;
    if (position === undefined) {
        position = track.track_number;
    }
    let playlistItem = new cody_music_1.PlaylistItem();
    playlistItem.type = "track";
    playlistItem.name = track.name;
    playlistItem.tooltip = getTrackTooltip(track);
    playlistItem.id = track.id;
    playlistItem.uri = track.uri;
    playlistItem.popularity = track.popularity;
    playlistItem.position = position;
    playlistItem.artist = getArtist(track);
    playlistItem.playerType = track.playerType;
    playlistItem.itemType = "track";
    playlistItem["albumId"] = (_a = track === null || track === void 0 ? void 0 : track.album) === null || _a === void 0 ? void 0 : _a.id;
    playlistItem["albumName"] = getAlbumName(track);
    playlistItem["description"] = getArtistAlbumDescription(track);
    delete playlistItem.tracks;
    return playlistItem;
}
exports.createPlaylistItemFromTrack = createPlaylistItemFromTrack;
function getTrackTooltip(track) {
    let tooltip = track.name;
    const artistName = getArtist(track);
    if (artistName) {
        tooltip += ` - ${artistName}`;
    }
    if (track.popularity) {
        tooltip += ` (Popularity: ${track.popularity})`;
    }
    return tooltip;
}
function getArtistAlbumDescription(track) {
    let artistName = getArtist(track);
    let albumName = getAlbumName(track);
    // return artist - album (but abbreviate both if the len is too large)
    if (artistName && albumName && artistName.length + albumName.length > 100) {
        // start abbreviating
        if (artistName.length > 50) {
            artistName = artistName.substring(0, 50) + "...";
        }
        if (albumName.length > 50) {
            albumName = albumName.substring(0, 50) + "...";
        }
    }
    return albumName ? `${artistName} - ${albumName}` : artistName;
}
function getArtist(track) {
    if (!track) {
        return null;
    }
    if (track.artist) {
        return track.artist;
    }
    if (track.artists && track.artists.length > 0) {
        const trackArtist = track.artists[0];
        return trackArtist.name;
    }
    return null;
}
function getTrackIdsForRecommendations(seedLimit = 5, seedTracks = [], offset = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        if (seedLimit === 0) {
            return [];
        }
        if (!spotifyLikedTracks) {
            yield populateLikedSongs();
        }
        seedLimit = offset + seedLimit;
        // up until limit
        if (spotifyLikedTracks === null || spotifyLikedTracks === void 0 ? void 0 : spotifyLikedTracks.length) {
            if (offset > spotifyLikedTracks.length - 1) {
                offset = 0;
            }
            seedTracks.push(...spotifyLikedTracks.slice(offset, seedLimit));
        }
        const remainingLen = seedLimit - seedTracks.length;
        if (remainingLen < seedLimit) {
            // find a few more
            Object.keys(playlistTracks).every((playlist_id) => {
                if (playlist_id !== view_constants_2.SPOTIFY_LIKED_SONGS_PLAYLIST_ID && playlistTracks[playlist_id] && playlistTracks[playlist_id].length >= remainingLen) {
                    seedTracks.push(...playlistTracks[playlist_id].splice(0, remainingLen));
                    return;
                }
            });
        }
        let trackIds = seedTracks.map((n) => n.id);
        return trackIds;
    });
}
function getAlbumName(track) {
    let albumName = track["albumName"];
    if (!albumName && track["album"] && track["album"].name) {
        albumName = track["album"].name;
    }
    return albumName;
}
function sortPlaylists(playlists, alphabetically = sortAlphabetically) {
    if (playlists && playlists.length > 0) {
        playlists.sort((a, b) => {
            if (alphabetically) {
                const nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                if (nameA < nameB)
                    //sort string ascending
                    return -1;
                if (nameA > nameB)
                    return 1;
                return 0; // default return value (no sorting)
            }
            else {
                const indexA = a["index"], indexB = b["index"];
                if (indexA < indexB)
                    // sort ascending
                    return -1;
                if (indexA > indexB)
                    return 1;
                return 0; // default return value (no sorting)
            }
        });
    }
}
exports.sortPlaylists = sortPlaylists;
function sortTracks(tracks) {
    if (tracks && tracks.length > 0) {
        tracks.sort((a, b) => {
            const nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
            if (nameA < nameB)
                //sort string ascending
                return -1;
            if (nameA > nameB)
                return 1;
            return 0; //default return value (no sorting)
        });
    }
}
//# sourceMappingURL=PlaylistDataManager.js.map
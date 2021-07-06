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
exports.createCommands = void 0;
const vscode_1 = require("vscode");
const MusicControlManager_1 = require("./music/MusicControlManager");
const Util_1 = require("./Util");
const cody_music_1 = require("cody-music");
const SocialShareManager_1 = require("./social/SocialShareManager");
const SlackManager_1 = require("./managers/SlackManager");
const RecTypeSelectorManager_1 = require("./selector/RecTypeSelectorManager");
const SortPlaylistSelectorManager_1 = require("./selector/SortPlaylistSelectorManager");
const SpotifyDeviceSelectorManager_1 = require("./selector/SpotifyDeviceSelectorManager");
const MusicCommandUtil_1 = require("./music/MusicCommandUtil");
const SearchSelectorManager_1 = require("./selector/SearchSelectorManager");
const MusicStateManager_1 = require("./music/MusicStateManager");
const SpotifyManager_1 = require("./managers/SpotifyManager");
const FileManager_1 = require("./managers/FileManager");
const UserStatusManager_1 = require("./managers/UserStatusManager");
const MusicTimeWebviewSidebar_1 = require("./sidebar/MusicTimeWebviewSidebar");
const view_constants_1 = require("./app/utils/view_constants");
const PlaylistDataManager_1 = require("./managers/PlaylistDataManager");
const PlaylistControlManager_1 = require("./managers/PlaylistControlManager");
const Constants_1 = require("./Constants");
/**
 * add the commands to vscode....
 */
function createCommands(ctx) {
    let cmds = [];
    const controller = MusicControlManager_1.MusicControlManager.getInstance();
    // DISPLAY README CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.launchReadme", () => {
        FileManager_1.displayReadmeIfNotExists(true /*override*/);
    }));
    // DISPLAY REPORT DASHBOARD CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.displayDashboard", () => {
        MusicControlManager_1.displayMusicTimeMetricsMarkdownDashboard();
    }));
    // PLAY NEXT CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.next", () => {
        controller.nextSong();
    }));
    // PLAY PREV CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.previous", () => {
        controller.previousSong();
    }));
    // PLAY CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.play", () => __awaiter(this, void 0, void 0, function* () {
        controller.playSong(1);
    })));
    // MUTE CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.mute", () => __awaiter(this, void 0, void 0, function* () {
        controller.setMuteOn();
    })));
    // UNMUTE CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.unMute", () => __awaiter(this, void 0, void 0, function* () {
        controller.setMuteOff();
    })));
    // REMOVE TRACK CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.removeTrack", (p) => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.removeTrackFromPlaylist(p);
    })));
    // SHARE CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.shareTrack", (node) => {
        SocialShareManager_1.SocialShareManager.getInstance().showMenu(node.id, node.name, false);
    }));
    // SEARCH CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.searchTracks", () => {
        // show the search input popup
        SearchSelectorManager_1.showSearchInput();
    }));
    // PAUSE CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.pause", () => {
        controller.pauseSong();
    }));
    // LIKE CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.like", (track) => {
        controller.setLiked(track, true);
    }));
    // UNLIKE CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.unlike", (track) => {
        controller.setLiked(track, false);
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.shuffleOff", () => {
        controller.setShuffleOff();
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.shuffleOn", () => {
        controller.setShuffleOn();
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.muteOn", () => {
        controller.setMuteOn();
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.muteOff", () => {
        controller.setMuteOff();
    }));
    // REPEAT OFF CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.repeatOn", () => {
        controller.setRepeatOnOff(true);
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.repeatTrack", () => {
        controller.setRepeatTrackOn();
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.repeatPlaylist", () => {
        controller.setRepeatPlaylistOn();
    }));
    // REPEAT ON OFF CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.repeatOff", () => {
        controller.setRepeatOnOff(false);
    }));
    // SHOW MENU CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.menu", () => {
        controller.showMenu();
    }));
    // FOLLOW PLAYLIST CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.follow", (p) => {
        PlaylistDataManager_1.followSpotifyPlaylist(p);
    }));
    // DISPLAY CURRENT SONG CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.currentSong", () => {
        PlaylistControlManager_1.launchTrackPlayer();
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.songTitleRefresh", () => __awaiter(this, void 0, void 0, function* () {
        const device = PlaylistDataManager_1.getBestActiveDevice();
        if (!device) {
            yield PlaylistDataManager_1.populateSpotifyDevices(false);
        }
        MusicStateManager_1.MusicStateManager.getInstance().fetchTrack();
    })));
    // SWITCH SPOTIFY
    cmds.push(vscode_1.commands.registerCommand("musictime.switchSpotifyAccount", () => __awaiter(this, void 0, void 0, function* () {
        SpotifyManager_1.switchSpotifyAccount();
    })));
    // CONNECT SPOTIFY CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.connectSpotify", () => __awaiter(this, void 0, void 0, function* () {
        SpotifyManager_1.connectSpotify();
    })));
    // CONNECT SLACK
    cmds.push(vscode_1.commands.registerCommand("musictime.connectSlack", () => {
        SlackManager_1.connectSlackWorkspace();
    }));
    // DISCONNECT SPOTIFY
    cmds.push(vscode_1.commands.registerCommand("musictime.disconnectSpotify", () => {
        SpotifyManager_1.disconnectSpotify();
    }));
    // DISCONNECT SLACK
    cmds.push(vscode_1.commands.registerCommand("musictime.disconnectSlack", (item) => {
        if (!item) {
            SlackManager_1.disconnectSlack();
        }
        else {
            SlackManager_1.disconnectSlackAuth(item.value);
        }
    }));
    // this should only be attached to the refresh button
    cmds.push(vscode_1.commands.registerCommand("musictime.refreshDeviceInfo", () => __awaiter(this, void 0, void 0, function* () {
        if (!PlaylistDataManager_1.requiresSpotifyAccess()) {
            yield PlaylistDataManager_1.populateSpotifyDevices(false);
        }
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.launchSpotify", () => {
        PlaylistControlManager_1.launchTrackPlayer(cody_music_1.PlayerName.SpotifyWeb);
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.launchAnalytics", () => {
        Util_1.launchMusicAnalytics();
    }));
    const deviceSelectTransferCmd = vscode_1.commands.registerCommand("musictime.transferToDevice", (d) => __awaiter(this, void 0, void 0, function* () {
        // transfer to this device
        vscode_1.window.showInformationMessage(`Connected to ${d.name}`);
        yield MusicCommandUtil_1.MusicCommandUtil.getInstance().runSpotifyCommand(cody_music_1.playSpotifyDevice, [d.id]);
        setTimeout(() => {
            // refresh the tree, no need to refresh playlists
            vscode_1.commands.executeCommand("musictime.refreshDeviceInfo");
        }, 3000);
    }));
    cmds.push(deviceSelectTransferCmd);
    const genreRecListCmd = vscode_1.commands.registerCommand("musictime.songGenreSelector", () => {
        RecTypeSelectorManager_1.showGenreSelections();
    });
    cmds.push(genreRecListCmd);
    const categoryRecListCmd = vscode_1.commands.registerCommand("musictime.songMoodSelector", () => {
        RecTypeSelectorManager_1.showMoodSelections();
    });
    cmds.push(categoryRecListCmd);
    const deviceSelectorCmd = vscode_1.commands.registerCommand("musictime.deviceSelector", () => {
        SpotifyDeviceSelectorManager_1.showDeviceSelectorMenu();
    });
    cmds.push(deviceSelectorCmd);
    // UPDATE RECOMMENDATIONS CMD
    cmds.push(vscode_1.commands.registerCommand("musictime.updateRecommendations", (args) => {
        // there's always at least 3 args
        const label = args[0];
        const likedSongSeedLimit = args[1];
        const seed_genres = args[2];
        const features = args.length > 3 ? args[3] : {};
        PlaylistDataManager_1.getRecommendations(label, likedSongSeedLimit, seed_genres, features);
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.refreshRecommendations", (args) => {
        PlaylistDataManager_1.refreshRecommendations();
    }));
    // signup button click
    cmds.push(vscode_1.commands.registerCommand("musictime.signUpAccount", () => __awaiter(this, void 0, void 0, function* () {
        UserStatusManager_1.showSignUpMenuOptions();
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.logInAccount", () => __awaiter(this, void 0, void 0, function* () {
        UserStatusManager_1.showLogInMenuOptions();
    })));
    // login button click
    cmds.push(vscode_1.commands.registerCommand("musictime.googleLogin", () => __awaiter(this, void 0, void 0, function* () {
        UserStatusManager_1.launchLogin("google", true);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.githubLogin", () => __awaiter(this, void 0, void 0, function* () {
        UserStatusManager_1.launchLogin("github", true);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.emailSignup", () => __awaiter(this, void 0, void 0, function* () {
        UserStatusManager_1.launchLogin("software", false);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.emailLogin", () => __awaiter(this, void 0, void 0, function* () {
        UserStatusManager_1.launchLogin("software", true);
    })));
    // WEB VIEW PROVIDER
    const mtWebviewSidebar = new MusicTimeWebviewSidebar_1.MusicTimeWebviewSidebar(ctx.extensionUri);
    cmds.push(vscode_1.window.registerWebviewViewProvider("musictime.webView", mtWebviewSidebar, {
        webviewOptions: {
            retainContextWhenHidden: true,
        },
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.refreshMusicTimeView", (tab_view, playlist_id, loading = false) => {
        mtWebviewSidebar.refresh(tab_view, playlist_id, loading);
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.submitAnIssue", () => {
        Util_1.launchWebUrl(Constants_1.vscode_mt_issues_url);
    }));
    // SORT TITLE COMMAND
    cmds.push(vscode_1.commands.registerCommand("musictime.sortIcon", () => {
        SortPlaylistSelectorManager_1.showSortPlaylistMenu();
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.sortAlphabetically", () => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.updateSort(true);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.sortToOriginal", () => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.updateSort(false);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.getTrackRecommendations", (node) => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.getTrackRecommendations(node);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.getAudioFeatureRecommendations", (features) => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.getMixedAudioFeatureRecs(features);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.showAlbum", (item) => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.getAlbumForTrack(item);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.fetchPlaylistTracks", (playlist_id) => __awaiter(this, void 0, void 0, function* () {
        if (playlist_id === view_constants_1.SPOTIFY_LIKED_SONGS_PLAYLIST_ID) {
            PlaylistDataManager_1.fetchTracksForLikedSongs();
        }
        else {
            PlaylistDataManager_1.fetchTracksForPlaylist(playlist_id);
        }
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.updateSelectedPlaylist", (playlist_id) => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.updateSelectedPlaylistId(playlist_id);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.playTrack", (item) => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.updateSelectedPlaylistId(item["playlist_id"]);
        PlaylistControlManager_1.playSelectedItem(item);
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.updateSelectedTabView", (tabView) => __awaiter(this, void 0, void 0, function* () {
        PlaylistDataManager_1.updateSelectedTabView(tabView);
        if (tabView === "recommendations") {
            // populate familiar recs, but don't refreshMusicTimeView
            // as the final logic will make that call
            yield PlaylistDataManager_1.getCurrentRecommendations();
        }
        else {
            // refresh the music time view
            vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
        }
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.installCodeTime", (item) => __awaiter(this, void 0, void 0, function* () {
        Util_1.launchWebUrl("vscode:extension/softwaredotcom.swdc-vscode");
    })));
    cmds.push(vscode_1.commands.registerCommand("musictime.displaySidebar", () => {
        // logic to open the sidebar (need to figure out how to reveal the sidebar webview)
        vscode_1.commands.executeCommand("workbench.view.extension.music-time-sidebar");
    }));
    cmds.push(vscode_1.commands.registerCommand("musictime.addToPlaylist", (p) => __awaiter(this, void 0, void 0, function* () {
        controller.addToPlaylistMenu(p);
    })));
    return vscode_1.Disposable.from(...cmds);
}
exports.createCommands = createCommands;
//# sourceMappingURL=command-helper.js.map
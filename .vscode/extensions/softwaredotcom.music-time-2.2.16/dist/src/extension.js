"use strict";
// Copyright (c) 2018 Software. All Rights Reserved.
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
exports.getCurrentColorKind = exports.intializePlugin = exports.activate = exports.deactivate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const OnboardManager_1 = require("./OnboardManager");
const Util_1 = require("./Util");
const command_helper_1 = require("./command-helper");
const FileManager_1 = require("./managers/FileManager");
const SpotifyManager_1 = require("./managers/SpotifyManager");
const websockets_1 = require("./websockets");
const PlaylistDataManager_1 = require("./managers/PlaylistDataManager");
let currentColorKind = undefined;
function deactivate(ctx) {
    websockets_1.clearWebsocketConnectionRetryTimeout();
}
exports.deactivate = deactivate;
function activate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        // has a session file, continue with initialization of the plugin
        OnboardManager_1.onboardPlugin(ctx, intializePlugin);
    });
}
exports.activate = activate;
function intializePlugin(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Loaded ${Util_1.getPluginName()} v${Util_1.getVersion()}`);
        //
        // add the player commands before we show the playlist
        //
        ctx.subscriptions.push(command_helper_1.createCommands(ctx));
        // migrate legacy spotify access token info to integration info
        yield SpotifyManager_1.migrateAccessInfo();
        // show the readme if it doesn't exist
        FileManager_1.displayReadmeIfNotExists();
        // This will initialize the user and spotify
        // this needs to happen first to enable spotify playlist and control logic
        yield PlaylistDataManager_1.initializeSpotify();
        activateColorKindChangeListener();
        try {
            websockets_1.initializeWebsockets();
        }
        catch (e) {
            console.error("Failed to initialize websockets", e);
        }
    });
}
exports.intializePlugin = intializePlugin;
function getCurrentColorKind() {
    if (!currentColorKind) {
        currentColorKind = vscode_1.window.activeColorTheme.kind;
    }
    return currentColorKind;
}
exports.getCurrentColorKind = getCurrentColorKind;
/**
 * Active color theme listener
 */
function activateColorKindChangeListener() {
    currentColorKind = vscode_1.window.activeColorTheme.kind;
    vscode_1.window.onDidChangeActiveColorTheme((event) => {
        currentColorKind = event.kind;
        // let the sidebar know the new current color kind
        setTimeout(() => {
            vscode_1.commands.executeCommand("musictime.refreshMusicTimeView");
        }, 250);
    });
}
//# sourceMappingURL=extension.js.map
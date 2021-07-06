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
exports.createAnonymousUser = exports.onboardPlugin = void 0;
const vscode_1 = require("vscode");
const DataController_1 = require("./DataController");
const Util_1 = require("./Util");
const HttpClient_1 = require("./HttpClient");
const FileManager_1 = require("./managers/FileManager");
let retry_counter = 0;
const one_min_millis = 1000 * 60;
function onboardPlugin(ctx, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const jwt = FileManager_1.getItem("jwt");
        if (jwt) {
            return callback(ctx);
        }
        const windowState = vscode_1.window.state;
        if (windowState.focused) {
            // perform primary window related work
            primaryWindowOnboarding(ctx, callback);
        }
        else {
            // call the secondary onboarding logic
            secondaryWindowOnboarding(ctx, callback);
            return callback(ctx);
        }
    });
}
exports.onboardPlugin = onboardPlugin;
function primaryWindowOnboarding(ctx, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const jwt = yield createAnonymousUser();
        if (jwt) {
            // great, it worked. call the callback
            return callback(ctx);
        }
        else {
            // not online, try again in a minute
            if (retry_counter === 0) {
                // show the prompt that we're unable connect to our app 1 time only
                Util_1.showOfflinePrompt(true);
            }
            // call activate again later
            setTimeout(() => {
                retry_counter++;
                onboardPlugin(ctx, callback);
            }, one_min_millis * 2);
        }
    });
}
/**
 * This is called if there's no JWT. If it reaches a
 * 6th call it will create an anon user.
 * @param ctx
 * @param callback
 */
function secondaryWindowOnboarding(ctx, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const serverIsOnline = yield DataController_1.serverIsAvailable();
        if (!serverIsOnline) {
            // not online, try again later
            setTimeout(() => {
                onboardPlugin(ctx, callback);
            }, one_min_millis);
            return;
        }
        else if (retry_counter < 5) {
            if (serverIsOnline) {
                retry_counter++;
            }
            // call activate again in about 15 seconds
            setTimeout(() => {
                onboardPlugin(ctx, callback);
            }, 1000 * 15);
            return;
        }
        // tried enough times, create an anon user
        yield createAnonymousUser();
        // call the callback
        return callback(ctx);
    });
}
/**
 * create an anonymous user based on github email or mac addr
 */
function createAnonymousUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const jwt = FileManager_1.getItem("jwt");
        // check one more time before creating the anon user
        if (!jwt) {
            // this should not be undefined if its an account reset
            let plugin_uuid = FileManager_1.getPluginUuid();
            let auth_callback_state = FileManager_1.getAuthCallbackState();
            const username = yield Util_1.getOsUsername();
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const hostname = yield Util_1.getHostname();
            const resp = yield HttpClient_1.softwarePost("/plugins/onboard", {
                timezone,
                username,
                plugin_uuid,
                hostname,
                auth_callback_state,
            });
            if (HttpClient_1.isResponseOk(resp) && resp.data && resp.data.jwt) {
                FileManager_1.setItem("jwt", resp.data.jwt);
                if (!resp.data.user.registered) {
                    FileManager_1.setItem("name", null);
                }
                FileManager_1.setAuthCallbackState(null);
                return resp.data.jwt;
            }
        }
        return null;
    });
}
exports.createAnonymousUser = createAnonymousUser;
//# sourceMappingURL=OnboardManager.js.map
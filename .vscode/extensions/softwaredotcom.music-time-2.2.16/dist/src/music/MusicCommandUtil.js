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
exports.MusicCommandUtil = void 0;
const cody_music_1 = require("cody-music");
const PlaylistDataManager_1 = require("../managers/PlaylistDataManager");
class MusicCommandUtil {
    constructor() {
        //
    }
    static getInstance() {
        if (!MusicCommandUtil.instance) {
            MusicCommandUtil.instance = new MusicCommandUtil();
        }
        return MusicCommandUtil.instance;
    }
    runSpotifyCommand(fnc, args = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            if (args && args.length) {
                result = yield fnc(...args);
            }
            else {
                result = yield fnc();
            }
            const resultStatus = this.getResponseStatus(result);
            if (resultStatus === 401 || resultStatus === 429) {
                // check to see if the access token is still valid
                yield this.checkIfAccessExpired(result);
                const error = this.getResponseError(result);
                if (this.isTooManyRequestsError(result)) {
                    console.log("Currently experiencing frequent spotify requests, please try again soon.");
                    return { status: 429 };
                }
                else if (error !== null) {
                    return error;
                }
            }
            return result;
        });
    }
    checkIfAccessExpired(result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.getResponseStatus(result) === 401) {
                let expired = yield cody_music_1.accessExpired();
                if (expired) {
                    console.error("Spotify access expired: ", result);
                }
            }
            else {
                const error = this.getResponseError(result);
                if (error) {
                    console.log("Spotify access expired error: ", error);
                }
            }
        });
    }
    isTooManyRequestsError(result) {
        return this.getResponseStatus(result) === 429 ? true : false;
    }
    isDeviceError(result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (result && this.getResponseStatus(result) === 404) {
                // check to see if there's an active device
                const { webPlayer, desktop, activeDevice, activeComputerDevice, activeWebPlayerDevice } = PlaylistDataManager_1.getDeviceSet();
                if (!webPlayer && !desktop) {
                    return true;
                }
            }
            return false;
        });
    }
    // error.response.data.error has...
    // {message, reason, status}
    getResponseError(resp) {
        if (resp && resp.error && resp.error.response && resp.error.response.data && resp.error.response.data.error) {
            return resp.error.response.data.error;
        }
        return null;
    }
    getResponseStatus(resp) {
        if (resp && resp.status) {
            return resp.status;
        }
        else if (resp && resp.data && resp.data.status) {
            return resp.data.status;
        }
        else if (resp && resp.error && resp.error.response && resp.error.response.status) {
            return resp.error.response.status;
        }
        return 200;
    }
}
exports.MusicCommandUtil = MusicCommandUtil;
//# sourceMappingURL=MusicCommandUtil.js.map
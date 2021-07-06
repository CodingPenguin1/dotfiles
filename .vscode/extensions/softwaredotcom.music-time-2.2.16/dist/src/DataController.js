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
exports.serverIsAvailable = exports.isNewHour = void 0;
const HttpClient_1 = require("./HttpClient");
const moment = require("moment-timezone");
let currentDayHour = null;
function isNewHour() {
    const dayHr = moment().format("YYYY-MM-DD-HH");
    if (!currentDayHour || dayHr !== currentDayHour) {
        currentDayHour = dayHr;
        return true;
    }
    return false;
}
exports.isNewHour = isNewHour;
function serverIsAvailable() {
    return __awaiter(this, void 0, void 0, function* () {
        let serverAvailable = yield HttpClient_1.softwareGet("/ping", null)
            .then((result) => {
            return HttpClient_1.isResponseOk(result);
        })
            .catch((e) => {
            return false;
        });
        return serverAvailable;
    });
}
exports.serverIsAvailable = serverIsAvailable;
//# sourceMappingURL=DataController.js.map
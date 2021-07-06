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
exports.getCachedTeams = exports.buildTeams = void 0;
const HttpClient_1 = require("../http/HttpClient");
const Util_1 = require("../Util");
let initializedCache = false;
let teams = [];
function buildTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        initializedCache = true;
        const resp = yield HttpClient_1.softwareGet("/v1/organizations", Util_1.getItem("jwt"));
        // synchronized team gathering
        teams = HttpClient_1.isResponseOk(resp) ? yield gatherTeamsFromOrgs(resp.data) : [];
    });
}
exports.buildTeams = buildTeams;
function getCachedTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!initializedCache) {
            yield buildTeams();
        }
        return teams;
    });
}
exports.getCachedTeams = getCachedTeams;
function gatherTeamsFromOrgs(orgs) {
    return __awaiter(this, void 0, void 0, function* () {
        let org_teams = [];
        if (orgs === null || orgs === void 0 ? void 0 : orgs.length) {
            orgs.forEach((org) => {
                var _a;
                // add every team from each org
                (_a = org.teams) === null || _a === void 0 ? void 0 : _a.forEach((team) => {
                    org_teams.push(Object.assign(Object.assign({}, team), { org_name: org.name, org_id: org.id }));
                });
            });
        }
        return org_teams;
    });
}
//# sourceMappingURL=TeamManager.js.map
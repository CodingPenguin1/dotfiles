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
exports.handleCurrentDayStatsUpdate = void 0;
const SummaryManager_1 = require("../managers/SummaryManager");
// { user_id: row["USER_ID"], data: SessionSummary, action: "update" }
function handleCurrentDayStatsUpdate(currentDayStatsInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        if (currentDayStatsInfo.data) {
            // update the session summary data
            SummaryManager_1.SummaryManager.getInstance().updateCurrentDayStats(currentDayStatsInfo.data);
        }
    });
}
exports.handleCurrentDayStatsUpdate = handleCurrentDayStatsUpdate;
//# sourceMappingURL=current_day_stats_update.js.map
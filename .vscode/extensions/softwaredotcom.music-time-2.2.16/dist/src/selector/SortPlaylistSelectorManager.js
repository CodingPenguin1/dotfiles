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
exports.showSortPlaylistMenu = void 0;
const MenuManager_1 = require("../MenuManager");
function showSortPlaylistMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        const items = getSortItems();
        let menuOptions = {
            items,
            placeholder: "Sort by",
        };
        const pick = yield MenuManager_1.showQuickPick(menuOptions);
        if (pick && pick.label) {
            return pick.label;
        }
        return null;
    });
}
exports.showSortPlaylistMenu = showSortPlaylistMenu;
function getSortItems() {
    const items = [
        {
            label: "Sort A-Z",
            command: "musictime.sortAlphabetically",
        },
        {
            label: "Sort by latest",
            command: "musictime.sortToOriginal",
        },
    ];
    return items;
}
//# sourceMappingURL=SortPlaylistSelectorManager.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpmItem = void 0;
const cody_music_1 = require("cody-music");
class KpmItem extends cody_music_1.PlaylistItem {
    constructor() {
        super(...arguments);
        this.description = "";
        this.value = "";
        this.commandArgs = [];
        this.contextValue = "";
        this.callback = null;
        this.icon = null;
        this.children = [];
        this.eventDescription = null;
    }
}
exports.KpmItem = KpmItem;
//# sourceMappingURL=models.js.map
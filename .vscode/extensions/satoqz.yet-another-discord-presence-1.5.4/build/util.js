"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathInfo = void 0;
const icons_json_1 = __importDefault(require("./icons.json"));
class PathInfo {
    doc;
    constructor(doc) {
        this.doc = doc;
    }
    setFolderAndFileName() {
        const segments = this.doc.fileName.split(/\/+|\\+/).filter((v) => v);
        this._fileName = segments.pop();
        this._folder = segments.pop() ?? "/";
    }
    _fileName;
    get fileName() {
        if (!this._fileName) {
            this.setFolderAndFileName();
        }
        return this._fileName;
    }
    _folder;
    get folder() {
        if (!this._folder) {
            this.setFolderAndFileName();
        }
        return this._folder;
    }
    _extension;
    get extension() {
        if (!this._extension) {
            if (this._fileName)
                this._extension = this._fileName.split(".").pop();
            else {
                this._extension = this.doc.fileName.split(".").pop();
            }
        }
        return this._extension;
    }
    _icon;
    get icon() {
        if (!this._icon) {
            let icon = icons_json_1.default.find((i) => i.matches.includes(this._fileName ?? this.fileName));
            if (!icon)
                icon = icons_json_1.default.find((i) => i.matches.includes(this._extension ?? this.extension));
            if (!icon)
                icon = icons_json_1.default.find((i) => i.matches.includes(this.doc.languageId));
            this._icon = icon ? icon.key : "text";
        }
        return this._icon;
    }
}
exports.PathInfo = PathInfo;

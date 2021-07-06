"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addSeparatorToNumber(str, sep, n) {
    var result = '';
    for (let i = 0; i < str.length; i++) {
        if (i > 0 && i % n == 0) {
            result = sep + result;
        }
        result = str[str.length - 1 - i] + result;
    }
    return result;
}
function addThousandsSeparator(str) {
    return addSeparatorToNumber(str, ',', 3);
}
exports.addThousandsSeparator = addThousandsSeparator;
function addBytesSeparator(str) {
    return addSeparatorToNumber(str, ' ', 8);
}
exports.addBytesSeparator = addBytesSeparator;
//# sourceMappingURL=utils.js.map
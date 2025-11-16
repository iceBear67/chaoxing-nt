"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUniqueId = exports.getMaxScreenScale = exports.hasDifferentScaleScreen = exports.osIsLowerThanWin10 = exports.osIsLowerThanWin7 = void 0;
const os_1 = __importDefault(require("os"));
const electron_1 = require("electron");
let m_UnigueId = 1;
function osIsLowerThanWin7() {
    const platform = os_1.default.platform();
    const release = os_1.default.release();
    if (platform === "win32" && parseFloat(release) <= 6.1) {
        return true;
    }
    else {
        return false;
    }
}
exports.osIsLowerThanWin7 = osIsLowerThanWin7;
function osIsLowerThanWin10() {
    const platform = os_1.default.platform();
    const release = os_1.default.release();
    if (platform === "win32" && parseFloat(release) < 10) {
        return true;
    }
    else {
        return false;
    }
}
exports.osIsLowerThanWin10 = osIsLowerThanWin10;
function hasDifferentScaleScreen() {
    let allDisplays = electron_1.screen.getAllDisplays();
    if (allDisplays.length <= 1) {
        return false;
    }
    let scaleFactor = allDisplays[0].scaleFactor;
    for (let i = 1; i < allDisplays.length; i++) {
        if (scaleFactor != allDisplays[i].scaleFactor) {
            return true;
        }
    }
    return false;
}
exports.hasDifferentScaleScreen = hasDifferentScaleScreen;
function getMaxScreenScale() {
    let allDisplays = electron_1.screen.getAllDisplays();
    if (allDisplays.length == 0) {
        return 1;
    }
    if (allDisplays.length == 1) {
        return allDisplays[0].scaleFactor;
    }
    let maxScale = allDisplays[0].scaleFactor;
    for (let i = 1; i < allDisplays.length; i++) {
        if (allDisplays[i].scaleFactor > maxScale) {
            maxScale = allDisplays[i].scaleFactor;
        }
    }
    return maxScale;
}
exports.getMaxScreenScale = getMaxScreenScale;
function createUniqueId() {
    m_UnigueId++;
    return m_UnigueId.toString(16);
}
exports.createUniqueId = createUniqueId;
module.exports = {
    osIsLowerThanWin7,
    osIsLowerThanWin10,
    hasDifferentScaleScreen,
    createUniqueId,
    getMaxScreenScale,
};
//# sourceMappingURL=CommonUtil.js.map
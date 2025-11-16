"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleFilePath = void 0;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
function getModuleFilePath(relativePath) {
    if (electron_1.app.isPackaged) {
        return path_1.default.join(process.resourcesPath, "app.asar.unpacked/module", relativePath);
    }
    else {
        console.log("resourcePath:", process.resourcesPath);
        return path_1.default.join(__dirname, "../../module", relativePath);
    }
}
exports.getModuleFilePath = getModuleFilePath;
//# sourceMappingURL=MoudlePathUtil.js.map
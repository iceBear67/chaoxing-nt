"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseFileInfo = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
function createBaseFileInfo(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        return;
    }
    const name = path_1.default.basename(filePath);
    const fsStat = fs_1.default.statSync(filePath);
    const mimeType = mime_types_1.default.lookup(name);
    return {
        name,
        path: filePath,
        size: fsStat.size,
        type: mimeType,
    };
}
exports.createBaseFileInfo = createBaseFileInfo;
//# sourceMappingURL=BaseFileInfo.js.map
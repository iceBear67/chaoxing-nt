"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertImageToBase64 = void 0;
const fs_1 = __importDefault(require("fs"));
function convertImageToBase64(filePath) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, { encoding: 'base64' }, function (err, data) {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}
exports.convertImageToBase64 = convertImageToBase64;
//# sourceMappingURL=image.js.map
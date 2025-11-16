"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openFileInManagerAndSelect = void 0;
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
function openFileInManagerAndSelect(filePath) {
    return new Promise((resolve) => {
        if (!filePath) {
            resolve({
                code: 1,
                msg: "filePath is empty",
            });
        }
        fs_1.default.stat(filePath, (error) => {
            if (error) {
                resolve({
                    code: 2,
                    msg: error.message,
                });
            }
            else {
                electron_1.shell.showItemInFolder(filePath);
                resolve({
                    code: 0,
                    msg: "success",
                });
            }
        });
    });
}
exports.openFileInManagerAndSelect = openFileInManagerAndSelect;
//# sourceMappingURL=FileMainHelper.js.map
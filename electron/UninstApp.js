"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delOldVersionFolders = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_1 = require("electron");
const child_process_1 = __importDefault(require("child_process"));
function delOldVersionFolders() {
    let curVersion = electron_1.app.getVersion().replace("-", ".");
    if (process.platform != "win32") {
        return;
    }
    let versions = curVersion.split(".");
    if (versions.length == 3 || versions.length == 4) {
        let pDir = path_1.default.join(electron_1.app.getPath("exe"), "../..");
        let dirs = fs_1.default.readdirSync(pDir);
        dirs.forEach((dir) => {
            let versions2 = dir.split(".");
            if (versions.length === versions2.length) {
                for (let i = 0; i < versions.length; i++) {
                    if (versions2[i] < versions[i]) {
                        delFolder(path_1.default.join(pDir, dir));
                        break;
                    }
                    else if (versions2[i] > versions[i]) {
                        break;
                    }
                }
            }
        });
        return true;
    }
    return false;
}
exports.delOldVersionFolders = delOldVersionFolders;
function delFolder(dir) {
    let cmd;
    if (process.platform == "darwin") {
        cmd = "rm -R " + dir;
    }
    else {
        cmd = `rmdir /Q /S "${dir}"`;
    }
    console.info("delFolder:", cmd);
    child_process_1.default.execSync(cmd, { encoding: "utf-8" });
}
//# sourceMappingURL=UninstApp.js.map
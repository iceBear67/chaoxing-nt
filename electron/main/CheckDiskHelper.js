"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const check_disk_space_1 = __importDefault(require("check-disk-space"));
const electron_1 = require("electron");
const DialogMainHelper_1 = require("./DialogMainHelper");
function checkFreeSpace(needSpace, win, bgcolor) {
    let pms = new Promise((resolve, reject) => {
        let logPath = electron_1.app.getPath("logs");
        (0, check_disk_space_1.default)(logPath).then((diskSpace) => {
            if (needSpace < 1) {
                needSpace = Math.floor(diskSpace.size * needSpace);
            }
            if (diskSpace.free < needSpace + 1024 * 1024) {
                let cipan = "磁";
                if (process.platform != "darwin") {
                    cipan = diskSpace.diskPath.substring(0, 1);
                }
                let showText = `您的${cipan}盘空间不足，请删除部分文件`;
                let option = {
                    id: "checkFreeSpace",
                    type: "alert",
                    content: showText,
                    backgroundColor: bgcolor,
                };
                (0, DialogMainHelper_1.openCommonDialog)(win, option);
                electron_1.ipcMain.once("_openCommonDialog_" + option.id, (event, data) => {
                    if (data === "ok") {
                        reject(-1);
                    }
                });
            }
            else {
                resolve(0);
            }
        });
    });
    return pms;
}
//# sourceMappingURL=CheckDiskHelper.js.map
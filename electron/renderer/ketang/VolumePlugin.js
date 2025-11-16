"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const RendererHelper_1 = require("../RendererHelper");
const cxHelper2_1 = require("../../../module/cxHelper2");
function getSpeakerVolume() {
    let pms = new Promise((resovle, reject) => {
        if (process.platform == "win32") {
            let data = (0, cxHelper2_1.getAudioVolume)(0);
            resovle(data);
        }
        else {
            resovle(execCmdInMac("output volume of (get volume settings)"));
        }
    });
    return pms;
}
function getRecordVolume() {
    let pms = new Promise((resovle, reject) => {
        if (process.platform == "win32") {
            let data = (0, cxHelper2_1.getAudioVolume)(1);
            resovle(data);
        }
        else {
            resovle(execCmdInMac("input volume of (get volume settings)"));
        }
    });
    return pms;
}
function setSpeakerVolume(volume) {
    let pms = new Promise((resovle, reject) => {
        if (process.platform == "win32") {
            (0, cxHelper2_1.setAudioVolume)(0, volume);
            resovle(true);
        }
        else {
            resovle(execCmdInMac(`set volume output volume ${volume} --100%`));
        }
    });
    return pms;
}
function setRecordVolume(volume) {
    let pms = new Promise((resovle, reject) => {
        if (process.platform == "win32") {
            (0, cxHelper2_1.setAudioVolume)(1, volume);
        }
        else {
            resovle(execCmdInMac(`set volume input  volume ${volume} --100%`));
        }
    });
    return pms;
}
function setRecordMute(mute) {
    let pms = new Promise((resovle, reject) => {
        if (process.platform == "win32") {
            const data = { deviceType: 1, oper: "mute", value: mute ? 1 : 0 };
            (0, RendererHelper_1.sendToMainProcess)("_send_audio_volume", data);
        }
        else {
            resovle(true);
        }
    });
    return pms;
}
function isRecordMute() {
    let pms = new Promise((resovle, reject) => {
        if (process.platform == "win32") {
            const data = { deviceType: 1, oper: "isMuted" };
            (0, RendererHelper_1.invokeToMainProcess)("_invoke_audio_volume", data).then((value) => {
                resovle(value == 1);
            });
        }
        else {
            resovle(true);
        }
    });
    return pms;
}
function execCmdInMac(script) {
    return new Promise((resolve, reject) => {
        let outData = "";
        let cProcess = child_process_1.default.spawn("osascript", ["-e", `${script}`]);
        cProcess.stdout.on("data", (data) => {
            outData += data;
        });
        cProcess.on("exit", (code) => {
            if (outData) {
                resolve(parseInt(outData.toString()));
            }
            else {
                resolve(true);
            }
        });
    });
}
module.exports = {
    getSpeakerVolume,
    getRecordVolume,
    setSpeakerVolume,
    setRecordVolume,
    setRecordMute,
    isRecordMute,
};
exports.default = module.exports;
//# sourceMappingURL=VolumePlugin.js.map
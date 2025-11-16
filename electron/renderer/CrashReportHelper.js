"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExtraParameter = exports.initCrashReport = void 0;
const electron_1 = require("electron");
const CookieHelper_1 = require("./CookieHelper");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const RendererHelper_1 = require("./RendererHelper");
const StoreKey_1 = require("../common/StoreKey");
function initCrashReport() {
    (0, RendererHelper_1.getTempStore)(StoreKey_1.StoreKey.crashUUID).then((uuid) => {
        if (uuid) {
            electron_1.crashReporter.addExtraParameter("uuid", uuid);
        }
    });
    (0, RendererHelper_1.onStoreDataChanged)(StoreKey_1.StoreKey.crashUUID, (uuid) => {
        electron_1.crashReporter.addExtraParameter("uuid", uuid);
    });
    updateExtraParameter();
    setInterval(() => {
        updateExtraParameter();
    }, 60 * 1000);
    (0, RendererHelper_1.getWinId)().then((winId) => {
        if (winId) {
            electron_1.crashReporter.addExtraParameter("winId", winId);
        }
    });
}
exports.initCrashReport = initCrashReport;
async function updateExtraParameter() {
    electron_1.crashReporter.addExtraParameter("cookie", document.cookie);
    electron_1.crashReporter.addExtraParameter("ua", navigator.userAgent);
    let puid = CookieHelper_1.docCookies.getItem("UID");
    if (puid) {
        electron_1.crashReporter.addExtraParameter("puid", puid);
    }
    let fid = CookieHelper_1.docCookies.getItem("fid");
    if (fid) {
        electron_1.crashReporter.addExtraParameter("fid", fid);
    }
    if (!puid) {
        let user = await (0, RendererHelper_1.getUser)();
        console.log("user:", user);
        if (user?.puid) {
            electron_1.crashReporter.addExtraParameter("puid", user.puid + "");
        }
        if (user?.fid) {
            electron_1.crashReporter.addExtraParameter("fid", user.fid + "");
        }
    }
    const key = "3Z3BLeXH";
    let curTime = new Date().getTime() + "";
    electron_1.crashReporter.addExtraParameter("enc", (0, CryptoUtil_1.encodeDes)(curTime, key));
}
exports.updateExtraParameter = updateExtraParameter;
//# sourceMappingURL=CrashReportHelper.js.map
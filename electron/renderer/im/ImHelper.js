"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToMainIfNeed = void 0;
const electron_1 = require("electron");
const RendererHelper_1 = require("../RendererHelper");
let ImCmdForMain = [];
(0, RendererHelper_1.getTempStore)("ImCmdForMain").then((data) => {
    if (data) {
        ImCmdForMain = data;
    }
});
(0, RendererHelper_1.onStoreDataChanged)("ImCmdForMain", (data) => {
    ImCmdForMain = data;
});
function sendToMainIfNeed(msg) {
    if (ImCmdForMain.includes(msg?.action)) {
        (0, RendererHelper_1.sendToMainProcess)("_im_cmd_to_main", msg);
    }
}
exports.sendToMainIfNeed = sendToMainIfNeed;
electron_1.contextBridge.exposeInMainWorld("ImHelper", {
    sendToMainIfNeed,
});
//# sourceMappingURL=ImHelper.js.map
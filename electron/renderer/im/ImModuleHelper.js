"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveImMessage = exports.sendImMessage = void 0;
const RendererHelper_1 = require("../RendererHelper");
function sendImMessage(data) {
    (0, RendererHelper_1.sendToView)("_sendImMessage", "tab_message", data);
}
exports.sendImMessage = sendImMessage;
function saveImMessage(data) {
    (0, RendererHelper_1.sendToView)("_saveImMessage", "tab_message", data);
}
exports.saveImMessage = saveImMessage;
//# sourceMappingURL=ImModuleHelper.js.map
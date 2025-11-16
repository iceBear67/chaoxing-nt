"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openProjectionBox = void 0;
const electron_1 = require("electron");
const RendererHelper_1 = require("../../../renderer/RendererHelper");
function openProjectionBox(data) {
    (0, RendererHelper_1.sendToMainProcess)("_openProjectionBox", data);
}
exports.openProjectionBox = openProjectionBox;
electron_1.contextBridge.exposeInMainWorld("ProjectionBoxHelper", openProjectionBox);
//# sourceMappingURL=ProjectionBoxHelper.js.map
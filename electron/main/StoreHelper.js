"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystem = exports.getStore = exports.getDefault = void 0;
const electron_store_1 = __importDefault(require("electron-store"));
function getDefault() {
    const store = new electron_store_1.default();
    return store;
}
exports.getDefault = getDefault;
function getStore(name) {
    const store = new electron_store_1.default({ name });
    return store;
}
exports.getStore = getStore;
function getSystem() {
    return getStore("system");
}
exports.getSystem = getSystem;
const defaultExports = { getDefault, getStore, getSystem };
module.exports = defaultExports;
exports.default = defaultExports;
//# sourceMappingURL=StoreHelper.js.map
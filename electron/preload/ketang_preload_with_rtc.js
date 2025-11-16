require("./common_preload");
require("../renderer/ketang/KetangHelper");
const { contextBridge } = require("electron");
const ScreenControl = require("../renderer/ScreenControl");
contextBridge.exposeInMainWorld("ScreenControl", ScreenControl);

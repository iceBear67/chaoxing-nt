require("./common_preload");
const RendererProcessHelper = require("../renderer/ketang/RendererProcessHelper");
const RendererHelper = require("../renderer/RendererHelper");
const { contextBridge } = require("electron");
const ScreenControl = require("../renderer/ScreenControl");

contextBridge.exposeInMainWorld("ScreenControl", ScreenControl);

contextBridge.exposeInMainWorld("RendererProcessHelper", RendererProcessHelper);
contextBridge.exposeInMainWorld("RendererHelper", RendererHelper);

const { contextBridge } = require("electron");
require("./common_preload");
const RendererProcessHelper = require("../renderer/ketang/RendererProcessHelper");
const RendererHelper = require("../renderer/RendererHelper");
contextBridge.exposeInMainWorld("RendererProcessHelper", RendererProcessHelper);
contextBridge.exposeInMainWorld("RendererHelper", RendererHelper);

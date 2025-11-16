require("./common_preload");
const { contextBridge } = require("electron");
const RendererHelper = require("../renderer/RendererHelper");
const MainWindowHelper = require("../renderer/MainWindowHelper");

const MessageDbHelper = require("../renderer/MessageDbHelper");

contextBridge.exposeInMainWorld("RendererHelper", RendererHelper);
contextBridge.exposeInMainWorld("MainWindowHelper", MainWindowHelper);
contextBridge.exposeInMainWorld("MessageDbHelper", MessageDbHelper);

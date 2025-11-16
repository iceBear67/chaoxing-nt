require("../../module/compile/lib/Jscx");
const { UseTimeLog } = require("../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLog();
m_UseTimeLog.start("screen_shot_preload");

m_UseTimeLog.end("1111");
const { contextBridge } = require("electron");
require("../renderer/BaseHelperForPreload");
m_UseTimeLog.end("222");
const RendererHelper = require("../renderer/RendererHelper");
m_UseTimeLog.end("6");
const MainWindowHelper = require("../renderer/MainWindowHelper");

m_UseTimeLog.end("9");

contextBridge.exposeInMainWorld("RendererHelper", RendererHelper);
m_UseTimeLog.end("13");

const ScreenShotHelper = require("../renderer/ScreenShotHelper");
contextBridge.exposeInMainWorld("ScreenShotHelper", ScreenShotHelper);
contextBridge.exposeInMainWorld("MainWindowHelper", MainWindowHelper);

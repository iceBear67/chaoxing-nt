require("./common_preload");
const { UseTimeLog } = require("../utils/UseTimeLogUtil");
let m_UseTimeLog = new UseTimeLog();
m_UseTimeLog.start("main_window_preload");

m_UseTimeLog.end("1111");
const { contextBridge } = require("electron");
m_UseTimeLog.end("222");
const RendererHelper = require("../renderer/RendererHelper");
m_UseTimeLog.end("3");
const MainWindowHelper = require("../renderer/MainWindowHelper");
m_UseTimeLog.end("4");


contextBridge.exposeInMainWorld("RendererHelper", RendererHelper);
m_UseTimeLog.end("10");
contextBridge.exposeInMainWorld("MainWindowHelper", MainWindowHelper);
m_UseTimeLog.end("11");
// contextBridge.exposeInMainWorld("RtcHelper", RtcHelper);
// m_UseTimeLog.end("12");
// contextBridge.exposeInMainWorld("ProjectionRtcHelper", ProjectionRtcHelper);
// m_UseTimeLog.end("13");

const RendererProcessHelper = require("../renderer/ketang/RendererProcessHelper");
m_UseTimeLog.end("14");
contextBridge.exposeInMainWorld("RendererProcessHelper", RendererProcessHelper);
m_UseTimeLog.end("15");

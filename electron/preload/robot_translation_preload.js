require("./ketang_common_preload");
const { contextBridge } = require("electron");
const RobotTranslate = require("../renderer/speechTranslate/robotTranslate");

contextBridge.exposeInMainWorld("RobotTranslate", RobotTranslate);

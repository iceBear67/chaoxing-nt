require("../../module/compile/lib/Jscx");
require("./ketang_common_preload");
const { contextBridge } = require("electron");
console.log("speech_translation_preload");
// const SpeechTranslate = require("../renderer/speechTranslate/speechTranslateXinYi");
const SpeechTranslate = require("../renderer/speechTranslate/speechTranslate");
contextBridge.exposeInMainWorld("SpeechTranslate", SpeechTranslate);

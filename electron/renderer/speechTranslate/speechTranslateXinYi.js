"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const XinYiHelper_1 = require("./XinYiHelper");
const WebAudioSpeechRecognizer = require("./tencent_speech/webaudiospeechrecognizer");
const AudioDataSpeechRecognizer = require("./tencent_speech/audiodataspeechrecognizer");
const { ipcRenderer } = require("electron");
const { default: axios } = require("axios");
const { URL, URLSearchParams } = require("url");
const { EventEmitter } = require("events");
const RendererHelper = require("../RendererHelper");
const m_EventEmitter = new EventEmitter();
const fs = require("fs");
class TranslationConfig {
    constructor() {
        this.fromLanguage = "zh";
        this.toLanguage = "en";
    }
}
class TranslationData {
    constructor() {
        this.index = -1;
    }
}
const m_TranslationDataList = new Array();
let m_webAudioSpeechRecognizer;
let m_audioDataSpeechRecognizerMap = new Map();
const m_TranslationConfig = new TranslationConfig();
function getTranslationDataById(id) {
    for (let i = m_TranslationDataList.length - 1; i >= 0; i--) {
        let data = m_TranslationDataList[i];
        if (data.id == id) {
            return data;
        }
    }
}
function deleteTranslationDataById(id) {
    for (let i = m_TranslationDataList.length - 1; i >= 0; i--) {
        let data = m_TranslationDataList[i];
        if (data.id == id) {
            m_TranslationDataList.splice(i, 1);
            return data;
        }
    }
}
function createTranslationData(id) {
    let data = new TranslationData();
    data.id = id;
    m_TranslationDataList.push(data);
    return data;
}
async function startRecognition(deviceId, sdkType) {
    if (sdkType == 0) {
        return startRecognitionUseAudioData();
    }
    else {
        return startRecognitionUseMic(deviceId);
    }
}
class UserAudioDataSpeechRecognizer {
    constructor() {
        this.m_lastWriteDataTime = new Date().getTime();
    }
    async createRecognizer(puid, username) {
        console.debug("createAudioDataSpeechRecognizer:");
        this.m_puid = puid;
        this.m_username = username;
        this.m_audioDataSpeechRecognizer = new XinYiHelper_1.XinYiRecognizer();
        let curRecognizerData;
        this.m_audioDataSpeechRecognizer.OnRecognitionStart(() => {
            console.debug("开始识别");
        });
        this.m_audioDataSpeechRecognizer.OnSentenceBegin((res) => {
            console.debug("一句话开始", res);
            let id = new Date().getTime();
            curRecognizerData = createTranslationData(id);
            curRecognizerData.puid = this.m_puid;
            curRecognizerData.username = this.m_username;
            curRecognizerData.tempSrcText = res?.result?.voice_text_str;
            curRecognizerData.status = 0;
            curRecognizerData.index = res?.result?.index;
            this.emitRecognizerText(curRecognizerData);
        });
        this.m_audioDataSpeechRecognizer.OnRecognitionResultChange((res) => {
            console.debug("识别变化时", res);
            if (curRecognizerData && res?.code == 200) {
                curRecognizerData.tempSrcText = res?.text;
                this.emitRecognizerText(curRecognizerData);
            }
        });
        this.m_audioDataSpeechRecognizer.OnSentenceEnd((res) => {
            console.debug("一句话结束", res);
            if (res?.code == 200 && res?.text) {
                if (curRecognizerData) {
                    curRecognizerData.tempSrcText = res.text;
                }
            }
            this.recognizerFinish(curRecognizerData);
        });
        this.m_audioDataSpeechRecognizer.OnError = (res) => {
            console.log("翻译插件，识别失败", res);
            this.recognizerFinish(curRecognizerData);
            m_audioDataSpeechRecognizerMap.delete(this.m_puid);
        };
        await this.m_audioDataSpeechRecognizer.start();
    }
    updateUserName(username) {
        this.m_username = username;
    }
    emitRecognizerText(recognizerData) {
        if (recognizerData && recognizerData.tempSrcText) {
            recognizerData.srcText =
                this.m_username + ":" + recognizerData.tempSrcText;
            m_EventEmitter.emit("updateRecognitionText", recognizerData);
        }
    }
    recognizerFinish(recognizerData) {
        if (recognizerData && recognizerData.status == 0) {
            if (recognizerData.tempSrcText) {
                recognizerData.srcText =
                    this.m_username + ":" + recognizerData.tempSrcText;
                recognizerData.status = 2;
                m_EventEmitter.emit("updateRecognitionText", recognizerData);
                translateText(recognizerData);
            }
            else {
                deleteTranslationDataById(recognizerData.id);
            }
        }
    }
    writeData(data) {
        this.m_lastWriteDataTime = new Date().getTime();
        this.m_audioDataSpeechRecognizer?.write(data);
    }
    stopOnWaitTimeOut() {
        let curTime = new Date().getTime();
        if (curTime - this.m_lastWriteDataTime > 20000) {
            this.stopRecognizer();
        }
    }
    stopRecognizer() {
        console.debug("stopRecognizer.");
        this.m_audioDataSpeechRecognizer.stop();
        m_audioDataSpeechRecognizerMap.delete(this.m_puid);
    }
}
let userRecognizeTimer;
function checkUserRecognizeTimeOut() {
    userRecognizeTimer = setInterval(() => {
        m_audioDataSpeechRecognizerMap.forEach((userRecognizer) => {
            userRecognizer.stopOnWaitTimeOut();
        });
    }, 5000);
}
async function startRecognitionUseAudioData() {
    if (!userRecognizeTimer) {
        checkUserRecognizeTimeOut();
    }
}
async function startRecognitionUseMic(deviceId) {
    console.debug("startRecognitionUseMic:", deviceId);
    const secretData = await ipcRenderer.invoke("_getTencentSpeechKey");
    if (!secretData) {
        return false;
    }
    console.debug("secretData:", secretData);
    if (m_webAudioSpeechRecognizer) {
        return;
    }
    const params = {
        secretid: secretData.tmpSecretId,
        secretkey: secretData.tmpSecretKey,
        appid: "1310175297",
        token: secretData.token,
        engine_model_type: "16k_zh",
        voice_format: 1,
        hotword_id: "08003a00000000000000000000000000",
        needvad: 1,
        filter_dirty: 1,
        filter_modal: 2,
        filter_punc: 0,
        convert_num_mode: 1,
        word_info: 2,
    };
    m_webAudioSpeechRecognizer = new WebAudioSpeechRecognizer(params, deviceId);
    let curRecognizerData;
    m_webAudioSpeechRecognizer.OnRecognitionStart = (res) => {
        console.debug("开始识别", res);
    };
    m_webAudioSpeechRecognizer.OnSentenceBegin = (res) => {
        console.debug("一句话开始", res);
        let id = new Date().getTime();
        curRecognizerData = createTranslationData(id);
        curRecognizerData.srcText = res?.result?.voice_text_str;
        curRecognizerData.status = 0;
        m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
    };
    m_webAudioSpeechRecognizer.OnRecognitionResultChange = (res) => {
        if (curRecognizerData) {
            curRecognizerData.srcText = res?.result?.voice_text_str;
            m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
        }
    };
    m_webAudioSpeechRecognizer.OnSentenceEnd = (res) => {
        console.debug("一句话结束", res);
        if (res?.result?.voice_text_str) {
            if (curRecognizerData) {
                curRecognizerData.srcText = res?.result?.voice_text_str;
                curRecognizerData.status = 2;
                m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
                translateText(curRecognizerData);
            }
        }
        else {
            if (curRecognizerData) {
                deleteTranslationDataById(curRecognizerData.id);
            }
        }
    };
    m_webAudioSpeechRecognizer.OnRecognitionComplete = (res) => {
        console.debug("识别结束", res);
    };
    m_webAudioSpeechRecognizer.OnError = (res) => {
        console.log("翻译插件，识别失败", res);
        m_webAudioSpeechRecognizer = undefined;
    };
    m_webAudioSpeechRecognizer.start();
    if (curRecognizerData &&
        curRecognizerData.status == 0 &&
        curRecognizerData.srcText) {
        m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
        translateText(curRecognizerData);
    }
}
function stopRecognition() {
    if (m_webAudioSpeechRecognizer) {
        m_webAudioSpeechRecognizer.stop();
        m_webAudioSpeechRecognizer = undefined;
    }
}
function calculateMD5Hash(str) {
    const hash = crypto_1.default.createHash("md5");
    hash.update(str, "utf8");
    return hash.digest("hex");
}
function existRepeatTranslate(translateData) {
    for (let i = m_TranslationDataList.length - 1; i >= 0; i--) {
        let data = m_TranslationDataList[i];
        if (data.srcText == translateData.srcText &&
            data.fromLanguage == translateData.fromLanguage &&
            data.toLanguage == translateData.toLanguage &&
            data.dstText) {
            translateData.status = 3;
            translateData.dstText = data.dstText;
            return true;
        }
    }
    return false;
}
function translateText(translateData) {
    translateData.fromLanguage = m_TranslationConfig.fromLanguage;
    translateData.toLanguage = m_TranslationConfig.toLanguage;
    if (existRepeatTranslate(translateData)) {
        m_EventEmitter.emit("updateRecognitionText", translateData);
        return;
    }
    const appid = "20210625000871932";
    const query = translateData.srcText;
    const salt = new Date().getTime();
    const secret_key = "nRS7d8jGkenXzvmS0flU";
    const str = appid + query + salt + secret_key;
    const sign = calculateMD5Hash(str);
    const url = new URL("https://fanyi-api.baidu.com/api/trans/vip/translate");
    const urlParms = new URLSearchParams();
    urlParms.append("q", query);
    urlParms.append("from", m_TranslationConfig.fromLanguage);
    urlParms.append("to", m_TranslationConfig.toLanguage);
    urlParms.append("appid", appid);
    urlParms.append("salt", salt);
    urlParms.append("sign", sign);
    url.search = urlParms.toString();
    console.debug("开始翻译：", url.toString());
    axios.get(url.toString()).then((response) => {
        if (response.status == 200) {
            let trans_result = response.data?.trans_result;
            if (trans_result && trans_result.length > 0) {
                translateData.dstText = trans_result[0].dst;
                translateData.status = 3;
                m_EventEmitter.emit("updateRecognitionText", translateData);
                return;
            }
        }
        translateData.status = 4;
        m_EventEmitter.emit("updateRecognitionText", translateData);
    });
}
function changeTranslationLanguage(data) {
    m_TranslationConfig.fromLanguage = data.fromLanguage;
    m_TranslationConfig.toLanguage = data.toLanguage;
}
function onUpdateRecognitionText(callback) {
    m_EventEmitter.on("updateRecognitionText", callback);
}
function clearRecognitionResult() {
    if (m_TranslationDataList.length > 0) {
        m_TranslationDataList.splice(0, m_TranslationDataList.length);
    }
}
RendererHelper.on("rtcAudioFrameData", async (data) => {
    for (let audioFrameData of data) {
        let userRecognizer = m_audioDataSpeechRecognizerMap.get(audioFrameData.uid);
        if (!userRecognizer) {
            console.debug("new UserAudioDataSpeechRecognizer:", audioFrameData.uid);
            userRecognizer = new UserAudioDataSpeechRecognizer();
            m_audioDataSpeechRecognizerMap.set(audioFrameData.uid, userRecognizer);
            await userRecognizer.createRecognizer(audioFrameData.uid, audioFrameData.username?.name);
        }
        else {
            userRecognizer.updateUserName(audioFrameData.username?.name);
        }
        userRecognizer.writeData(audioFrameData.buffer);
    }
});
RendererHelper.sendToOtherWindow("initReceiveAudioFrame", "meetWindow");
module.exports = {
    startRecognition,
    stopRecognition,
    onUpdateRecognitionText,
    changeTranslationLanguage,
    clearRecognitionResult,
};
//# sourceMappingURL=speechTranslateXinYi.js.map
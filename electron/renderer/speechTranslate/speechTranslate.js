const crypto = require("crypto");
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
  fromLanguage = "zh";
  toLanguage = "en";
}

/**
 * 识别、翻译结果数据
 */
class TranslationData {
  id;
  puid;
  username;
  tempSrcText;
  srcText;
  dstText;
  fromLanguage;
  toLanguage;
  /**
   *status:识别状态
   *0：正在识别
   *1：识别完成
   *2：正在翻译
   *3：翻译完成
   *4：翻译失败
   */
  status;
  index = -1; //腾讯返回，避免腾讯bug，多次反馈一句话开始
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
  } else {
    return startRecognitionUseMic(deviceId);
  }
}

class UserAudioDataSpeechRecognizer {
  m_puid;
  m_username;
  m_audioDataSpeechRecognizer;
  m_lastWriteDataTime = new Date().getTime();
  // m_dataBuffer = Buffer.alloc(0);
  constructor() {}
  async createRecognizer(puid, username) {
    console.debug("createAudioDataSpeechRecognizer:");
    this.m_puid = puid;
    this.m_username = username;
    const secretData = await ipcRenderer.invoke("_getTencentSpeechKey");
    if (!secretData) {
      return false;
    }
    // console.debug("secretData:", secretData);
    const params = {
      // 用户参数
      secretid: secretData.tmpSecretId,
      secretkey: secretData.tmpSecretKey,
      appid: "1310175297",
      // 临时密钥参数，非必填
      token: secretData.token,
      // 实时识别接口参数
      engine_model_type: "16k_zh", // 因为内置WebRecorder采样16k的数据，所以参数 engineModelType 需要选择16k的引擎，为 '16k_zh'
      // 以下为非必填参数，可跟据业务自行修改
      voice_format: 1,
      hotword_id: "08003a00000000000000000000000000",
      needvad: 1,
      filter_dirty: 1,
      filter_modal: 2,
      filter_punc: 0,
      convert_num_mode: 1,
      word_info: 2,
    };
    // 实例化类
    this.m_audioDataSpeechRecognizer = new AudioDataSpeechRecognizer(params);
    let curRecognizerData;

    // 开始识别(此时连接已经建立)
    this.m_audioDataSpeechRecognizer.OnRecognitionStart = (res) => {
      console.debug("开始识别", res);
    };
    // 一句话开始
    this.m_audioDataSpeechRecognizer.OnSentenceBegin = (res) => {
      console.debug("一句话开始", res);
      let existRecognierData = false;
      if (curRecognizerData) {
        if (curRecognizerData.index == res?.result?.index) {
          existRecognierData = true;
        } else {
          this.recognizerFinish(curRecognizerData);
        }
      }
      if (curRecognizerData && curRecognizerData.index == res?.result?.index) {
        this.recognizerFinish(curRecognizerData);
      }
      if (!existRecognierData) {
        let id = new Date().getTime();
        curRecognizerData = createTranslationData(id);
        curRecognizerData.puid = this.m_puid;
        curRecognizerData.username = this.m_username;
        curRecognizerData.tempSrcText = res?.result?.voice_text_str;
        curRecognizerData.status = 0;
        curRecognizerData.index = res?.result?.index;
        this.emitRecognizerText(curRecognizerData);
        // m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
      }
    };
    // 识别变化时
    this.m_audioDataSpeechRecognizer.OnRecognitionResultChange = (res) => {
      //  console.debug("识别变化时", res);
      if (curRecognizerData) {
        curRecognizerData.tempSrcText = res?.result?.voice_text_str;
        this.emitRecognizerText(curRecognizerData);
        // m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
      }
    };
    // 一句话结束
    this.m_audioDataSpeechRecognizer.OnSentenceEnd = (res) => {
      console.debug("一句话结束", res);
      if (res?.result?.voice_text_str) {
        if (curRecognizerData) {
          curRecognizerData.tempSrcText = res?.result?.voice_text_str;
        }
      }
      this.recognizerFinish(curRecognizerData);
    };
    // 识别结束
    this.m_audioDataSpeechRecognizer.OnRecognitionComplete = (res) => {
      console.debug("识别结束", res);
    };
    // 识别错误
    this.m_audioDataSpeechRecognizer.OnError = (res) => {
      console.log("翻译插件，识别失败", res);
      this.recognizerFinish(curRecognizerData);
      m_audioDataSpeechRecognizerMap.delete(this.m_puid);
      // this.stopRecognizer();
    };

    // 建立录音同时建立websocket连接
    this.m_audioDataSpeechRecognizer.start();
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
      } else {
        deleteTranslationDataById(recognizerData.id);
      }
    }
  }

  writeData(data) {
    // this.m_dataBuffer = Buffer.concat([this.m_dataBuffer, data]);
    // console.debug(
    //   "writeData:",
    //   this.m_puid,
    //   data.length,
    //   new Date().toISOString()
    // );
    this.m_lastWriteDataTime = new Date().getTime();
    this.m_audioDataSpeechRecognizer?.writeAudioData(data);
  }

  // writeDataEnd() {
  //   if (this.m_dataBuffer.length > 0) {
  //     // console.debug("this.m_dataBuffer.length:", this.m_dataBuffer.length);
  //     this.m_lastWriteDataTime = new Date().getTime();
  //     // fs.writeFileSync(
  //     //   "/Users/chenxi/work/2024/202404/temp/js1.pcm",
  //     //   this.m_dataBuffer,
  //     //   { encoding: "binary", flag: "a" }
  //     // );
  //     // let swappedBuffer = this.swapEndian16(this.m_dataBuffer);
  //     this.m_audioDataSpeechRecognizer.writeAudioData(this.m_dataBuffer);
  //     this.m_dataBuffer = Buffer.alloc(0);
  //   }
  // }

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
//

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
    // 用户参数
    secretid: secretData.tmpSecretId,
    secretkey: secretData.tmpSecretKey,
    appid: "1310175297",
    // 临时密钥参数，非必填
    token: secretData.token,
    // 实时识别接口参数
    engine_model_type: "16k_zh", // 因为内置WebRecorder采样16k的数据，所以参数 engineModelType 需要选择16k的引擎，为 '16k_zh'
    // 以下为非必填参数，可跟据业务自行修改
    voice_format: 1,
    hotword_id: "08003a00000000000000000000000000",
    needvad: 1,
    filter_dirty: 1,
    filter_modal: 2,
    filter_punc: 0,
    convert_num_mode: 1,
    word_info: 2,
  };
  // 实例化类
  m_webAudioSpeechRecognizer = new WebAudioSpeechRecognizer(params, deviceId);
  let curRecognizerData;

  // 开始识别(此时连接已经建立)
  m_webAudioSpeechRecognizer.OnRecognitionStart = (res) => {
    console.debug("开始识别", res);
  };
  // 一句话开始
  m_webAudioSpeechRecognizer.OnSentenceBegin = (res) => {
    console.debug("一句话开始", res);
    // if (
    //   curRecognizerData &&
    //   curRecognizerData.status == 0 &&
    //   curRecognizerData.srcText
    // ) {
    //   m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
    //   translateText(curRecognizerData);
    // }
    let id = new Date().getTime();
    curRecognizerData = createTranslationData(id);
    curRecognizerData.srcText = res?.result?.voice_text_str;
    curRecognizerData.status = 0;
    m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
  };
  // 识别变化时
  m_webAudioSpeechRecognizer.OnRecognitionResultChange = (res) => {
    //  console.debug("识别变化时", res);
    if (curRecognizerData) {
      curRecognizerData.srcText = res?.result?.voice_text_str;
      m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
    }
  };
  // 一句话结束
  m_webAudioSpeechRecognizer.OnSentenceEnd = (res) => {
    console.debug("一句话结束", res);
    if (res?.result?.voice_text_str) {
      if (curRecognizerData) {
        curRecognizerData.srcText = res?.result?.voice_text_str;
        curRecognizerData.status = 2;
        m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
        translateText(curRecognizerData);
      }
    } else {
      if (curRecognizerData) {
        deleteTranslationDataById(curRecognizerData.id);
      }
    }
  };
  // 识别结束
  m_webAudioSpeechRecognizer.OnRecognitionComplete = (res) => {
    console.debug("识别结束", res);
  };
  // 识别错误
  m_webAudioSpeechRecognizer.OnError = (res) => {
    console.log("翻译插件，识别失败", res);
    m_webAudioSpeechRecognizer = undefined;
  };

  // 建立录音同时建立websocket连接
  m_webAudioSpeechRecognizer.start();
  if (
    curRecognizerData &&
    curRecognizerData.status == 0 &&
    curRecognizerData.srcText
  ) {
    m_EventEmitter.emit("updateRecognitionText", curRecognizerData);
    translateText(curRecognizerData);
  }
  // // 断开连接
  // if (连接已经建立...) {
  //    m_webAudioSpeechRecognizer.stop();
  // }
}

function stopRecognition() {
  if (m_webAudioSpeechRecognizer) {
    m_webAudioSpeechRecognizer.stop();
    m_webAudioSpeechRecognizer = undefined;
  }
}

/**
 * 百度翻译加密
 * @param {*} str
 * @returns
 */
function calculateMD5Hash(str) {
  const hash = crypto.createHash("md5");
  hash.update(str, "utf8");
  return hash.digest("hex");
}

/**
 * 检查是否存在已存在的重复翻译，如存在，直接获取结果，避免多次请求
 * @param {*} translateData
 */
function existRepeatTranslate(translateData) {
  for (let i = m_TranslationDataList.length - 1; i >= 0; i--) {
    let data = m_TranslationDataList[i];
    if (
      data.srcText == translateData.srcText &&
      data.fromLanguage == translateData.fromLanguage &&
      data.toLanguage == translateData.toLanguage &&
      data.dstText
    ) {
      translateData.status = 3;
      translateData.dstText = data.dstText;
      return true;
    }
  }
  return false;
}

/**
 * 翻译文本
 * @param {*} translateData
 */
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
    //  console.debug("translateText result:status:", response.status);
    //  console.debug("translateText result:data:", JSON.stringify(response.data));
    //{"from":"zh","to":"en","trans_result":[{"src":"你好，你好。","dst":"Hello, hello."}]}
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

/**
 * 修改翻译方向
 * @param {*} data
 */
function changeTranslationLanguage(data) {
  m_TranslationConfig.fromLanguage = data.fromLanguage;
  m_TranslationConfig.toLanguage = data.toLanguage;
}

/**
 * 识别、翻译结果变化回调
 * @param {*} callback
 */
function onUpdateRecognitionText(callback) {
  m_EventEmitter.on("updateRecognitionText", callback);
}

function clearRecognitionResult() {
  if (m_TranslationDataList.length > 0) {
    m_TranslationDataList.splice(0, m_TranslationDataList.length);
  }
}

RendererHelper.on("rtcAudioFrameData", async (data) => {
  console.debug("receiveData:", new Date().toISOString(), data);
  // let tempRecognizers = [];
  for (let audioFrameData of data) {
    let userRecognizer = m_audioDataSpeechRecognizerMap.get(audioFrameData.uid);
    if (!userRecognizer) {
      console.debug("new UserAudioDataSpeechRecognizer:", audioFrameData.uid);
      userRecognizer = new UserAudioDataSpeechRecognizer();

      m_audioDataSpeechRecognizerMap.set(audioFrameData.uid, userRecognizer);
      await userRecognizer.createRecognizer(
        audioFrameData.uid,
        audioFrameData.username?.name
      );
    } else {
      userRecognizer.updateUserName(audioFrameData.username?.name);
    }
    userRecognizer.writeData(audioFrameData.buffer);

    // if (!tempRecognizers.includes(userRecognizer)) {
    //   tempRecognizers.push(userRecognizer);
    // }
  }
  // for (let tempRecognizer of tempRecognizers) {
  //   tempRecognizer.writeDataEnd();
  // }
});

RendererHelper.sendToOtherWindow("initReceiveAudioFrame", "meetWindow");

// startRecognizer();

module.exports = {
  startRecognition,
  stopRecognition,
  onUpdateRecognitionText,
  changeTranslationLanguage,
  clearRecognitionResult,
};

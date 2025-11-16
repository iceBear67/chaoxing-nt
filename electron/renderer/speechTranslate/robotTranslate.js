const crypto = require("crypto");
const WebAudioSpeechRecognizer = require("./tencent_speech/webaudiospeechrecognizer");
const { ipcRenderer } = require("electron");
const { EventEmitter } = require("events");
const m_EventEmitter = new EventEmitter();
const { pinyin } = require('pinyin-pro');

/**
 * 识别、翻译结果数据
 */
class TranslationData {
  id;
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
}


let m_webAudioSpeechRecognizer;

let curRecognizerData = null  // 当前识别数据
let m_TimeId = null
let m_openStatus = 0  // 开启状态
let isAdvanceEnd = false  //是否提前结束
// 创建正则表达式模式，用于匹配多个变体
const regexPattern = /.*xiaoxin(g?)xiaoxin(g?).*/;

async function startRecognition(deviceId) {
  console.debug("startRecognition:", deviceId);
  const secretData = await ipcRenderer.invoke("_getTencentSpeechKey");
  if (!secretData) {
    return false;
  }
  console.debug("secretData:", secretData);
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
    vad_silence_time: 500
  };
  // 实例化类
  m_webAudioSpeechRecognizer = new WebAudioSpeechRecognizer(params, deviceId);


  // 开始识别(此时连接已经建立)
  m_webAudioSpeechRecognizer.OnRecognitionStart = (res) => {
    console.debug("开始识别", res);
  };
  // 一句话开始
  m_webAudioSpeechRecognizer.OnSentenceBegin = (res) => {
    console.debug("一句话开始", res);
    if (m_openStatus && res?.result?.voice_text_str) {
      curRecognizerData = {
        id: new Date().getTime(),
        text: res?.result?.voice_text_str
      }
      m_TimeId = setTimeout(() => {
        console.debug("3秒无变化提前结束===begin", res);
        m_EventEmitter.emit("updateRecognitionText", { text: curRecognizerData.text, status: 1, isEnd: 1 });
        isAdvanceEnd = false
        curRecognizerData = null
        m_TimeId && clearTimeout(m_TimeId)
        m_TimeId = null
      }, 3000)
      m_EventEmitter.emit("updateRecognitionText", { text: res?.result?.voice_text_str, status: 1, isEnd: 0 });
    }
  };
  // 识别变化时
  m_webAudioSpeechRecognizer.OnRecognitionResultChange = (res) => {
    console.debug("识别变化时", res);
    if (m_openStatus && res?.result?.voice_text_str && !isAdvanceEnd) {
      m_TimeId && clearTimeout(m_TimeId)
      m_TimeId = null
      curRecognizerData.text = res?.result?.voice_text_str
      if (res?.result?.voice_text_str?.length > 20) {
        // 超过20个字直接截掉
        console.debug("超过20个字", res);
        m_EventEmitter.emit("updateRecognitionText", { text: res?.result?.voice_text_str?.slice(0, 21), status: 1, isEnd: 1 });
        isAdvanceEnd = true
        return
      }
      m_TimeId = setTimeout(() => {
        console.debug("3秒无变化提前结束===change", res);
        m_EventEmitter.emit("updateRecognitionText", { text: curRecognizerData.text, status: 1, isEnd: 1 });
        isAdvanceEnd = false
        curRecognizerData = null
        m_TimeId && clearTimeout(m_TimeId)
        m_TimeId = null
      }, 3000)
      m_EventEmitter.emit("updateRecognitionText", { text: res?.result?.voice_text_str, status: 1, isEnd: 0 });
    }
  };
  // 一句话结束
  m_webAudioSpeechRecognizer.OnSentenceEnd = (res) => {
    console.debug("一句话结束", res);
    if (res?.result?.voice_text_str && !isAdvanceEnd) {
      // 已经开启
      if (m_openStatus) {
        if (!m_TimeId) {
          // 不存在说明已经返回
          return
        }
        m_TimeId && clearTimeout(m_TimeId)
        m_TimeId = null
        curRecognizerData = null
        m_EventEmitter.emit("updateRecognitionText", { text: res?.result?.voice_text_str, status: 1, isEnd: 1 });
      } else {
        const chineseText = res?.result?.voice_text_str.match(/[\u4e00-\u9fa5]+/g).join('');
        const pinyinArray = pinyin(chineseText, { toneType: 'none', type: 'array' })
        if (regexPattern.test(pinyinArray.join(''))) {
          m_openStatus = 1
          m_EventEmitter.emit("updateRecognitionText", { text: res?.result?.voice_text_str, status: 0, isEnd: 0 });
        }
      }
    }
    isAdvanceEnd = false
  };
  // 识别结束
  m_webAudioSpeechRecognizer.OnRecognitionComplete = (res) => {
    console.debug("识别结束", res);
    isAdvanceEnd = false
  };
  // 识别错误
  m_webAudioSpeechRecognizer.OnError = (res) => {
    console.log("翻译插件，识别失败", res);
  };

  // 建立录音同时建立websocket连接
  m_webAudioSpeechRecognizer.start();

  // // 断开连接
  // if (连接已经建立...) {
  //    m_webAudioSpeechRecognizer.stop();
  // }
}

function stopRecognition() {
  if (m_webAudioSpeechRecognizer) {
    m_webAudioSpeechRecognizer.stop();
  }
}

/**
 * 识别、翻译结果变化回调
 * @param {*} callback
 */
function onUpdateRecognitionText(callback) {
  m_EventEmitter.on("updateRecognitionText", callback);
}

function changeOpenStatus(status) {
  m_openStatus = status
}

module.exports = {
  startRecognition,
  stopRecognition,
  onUpdateRecognitionText,
  changeOpenStatus
};

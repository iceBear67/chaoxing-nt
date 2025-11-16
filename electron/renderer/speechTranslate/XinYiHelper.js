"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebXinyiSpeechRecognizer = exports.XinYiRecognizer = void 0;
const WebRecorder = require("./tencent_speech/webrecorder");
const ws_1 = require("ws");
const RendererHelper_1 = require("../RendererHelper");
const guid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
class XinYiRecognizer extends ws_1.EventEmitter {
    constructor() {
        super();
        this.m_SentenceStart = false;
    }
    async start() {
        const apiKey = "G8Li693K";
        const ts = new Date().getTime();
        let sign = await (0, RendererHelper_1.invokeToMainProcess)("_getXinYiSign", apiKey, ts);
        if (!sign) {
            return;
        }
        const url = `wss://asr.newtranx.com/v2/recognize?from=zh&ts=${ts}&sign=${sign}&apikey=${apiKey}`;
        this.m_Socket = new ws_1.WebSocket(url);
        this.m_Socket.on("open", () => {
            this.m_Connected = true;
            this.emit("OnRecognitionStart");
        });
        this.m_Socket.on("close", () => {
            this.m_Connected = false;
        });
        this.m_Socket.on("error", (err) => {
            this.m_Connected = false;
            this.emit("onError", err);
        });
        this.m_Socket.on("message", (data, isBinary) => {
            let res = JSON.parse(data.toString("utf8"));
            if (res?.code == 200) {
                if (res.final) {
                    this.emit("OnSentenceEnd", res);
                    this.m_SentenceStart = false;
                }
                else {
                    if (!this.m_SentenceStart) {
                        this.m_SentenceStart = true;
                        this.emit("OnSentenceBegin", res);
                    }
                    else {
                        this.emit("OnRecognitionResultChange", res);
                    }
                }
            }
            else {
                this.m_Connected = false;
                this.emit("onError", "接口返回错误");
                this.m_Socket.close();
            }
        });
    }
    write(data) {
        if (this.m_Connected) {
            this.m_Socket.send(data);
        }
    }
    stop() {
        this.m_Socket.close();
    }
    OnRecognitionStart(callback) {
        this.removeAllListeners("OnRecognitionStart");
        this.on("OnRecognitionStart", callback);
    }
    OnSentenceBegin(callback) {
        this.removeAllListeners("OnSentenceBegin");
        this.on("OnSentenceBegin", callback);
    }
    OnRecognitionResultChange(callback) {
        this.removeAllListeners("OnRecognitionResultChange");
        this.on("OnRecognitionResultChange", callback);
    }
    OnSentenceEnd(callback) {
        this.removeAllListeners("OnSentenceEnd");
        this.on("OnSentenceEnd", callback);
    }
    OnError(callback) {
        this.removeAllListeners("OnError");
        this.on("OnError", callback);
    }
}
exports.XinYiRecognizer = XinYiRecognizer;
const m_XinYiRecognizer = new XinYiRecognizer();
class WebXinyiSpeechRecognizer {
    constructor(deviceId) {
        this.recorder = null;
        this.deviceId = deviceId;
        this.requestId = guid();
        this.speechRecognizer = m_XinYiRecognizer;
    }
    start() {
        this.recorder = new WebRecorder(this.requestId, this.deviceId);
        this.recorder.OnReceivedData = (data) => {
            if (this.isCanSendData && this.speechRecognizer) {
                this.speechRecognizer.write(data);
            }
        };
        this.recorder.OnError = (err) => {
            this.stop();
            this.OnError(err);
        };
        this.recorder.OnStop = (res) => {
            if (this.speechRecognizer) {
                this.speechRecognizer.stop();
                this.speechRecognizer = null;
            }
            this.OnRecorderStop();
            this.isCanSendData = false;
        };
        this.recorder.start();
        this.speechRecognizer.OnRecognitionStart(() => {
            if (this.recorder) {
                this.OnRecognitionStart();
                this.isCanSendData = true;
            }
            else {
                this.speechRecognizer && this.speechRecognizer.stop();
            }
        });
        this.speechRecognizer.OnSentenceBegin((res) => {
            this.OnSentenceBegin(res);
        });
        this.speechRecognizer.OnRecognitionResultChange((res) => {
            this.OnRecognitionResultChange(res);
        });
        this.speechRecognizer.OnSentenceEnd((res) => {
            this.OnSentenceEnd(res);
        });
        this.speechRecognizer.OnError((res) => {
            if (this.speechRecognizer) {
                this.OnError(res);
            }
            this.speechRecognizer = null;
            this.recorder && this.recorder.stop();
            this.isCanSendData = false;
        });
        this.speechRecognizer.start();
    }
    stop() {
        console.log("stop function is click");
        if (this.recorder) {
            this.recorder.stop();
        }
    }
    destroyStream() {
        console.log("destroyStream function is click", this.recorder);
        if (this.recorder) {
            this.recorder.destroyStream();
        }
    }
    OnRecognitionStart() { }
    OnSentenceBegin(res) { }
    OnRecognitionResultChange(res) { }
    OnSentenceEnd(res) { }
    OnRecognitionComplete() { }
    OnError(err) { }
    OnRecorderStop() { }
}
exports.WebXinyiSpeechRecognizer = WebXinyiSpeechRecognizer;
//# sourceMappingURL=XinYiHelper.js.map
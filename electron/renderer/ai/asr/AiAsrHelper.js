"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAsr = exports.RecText = void 0;
const ws_1 = require("ws");
const events_1 = require("events");
const RendererHelper_1 = require("../../RendererHelper");
const webrecorder_1 = require("../util/webrecorder");
const electron_1 = require("electron");
const benz_amr_recorder_1 = __importDefault(require("benz-amr-recorder"));
const fs_1 = __importDefault(require("fs"));
const WS_ADDRESS = "wss://asr-ws.chaoxing.com";
const SECRET_ID = "bc5e6e16030a403b850ea6fe53ba7852";
function removeLeadingChinesePunctuation(str) {
    const regex = /^[\u3000-\u303F]+/;
    return str.replace(regex, "");
}
class RecText {
    constructor() {
        this.startRec = false;
        this.tempText = "";
        this.recText = "";
    }
}
exports.RecText = RecText;
class AiAsr extends events_1.EventEmitter {
    constructor() {
        super();
        this.m_OnRunning = false;
        this.m_AsrType = 1;
        this.m_RecText = new RecText();
        this.m_AmrText = "";
        this.m_WsConnecter = new WebSocketConnect();
        this.m_WsConnecter.on("open", () => {
            console.log("m_WsConnecter.open:");
        });
        this.m_WsConnecter.on("message", (msg) => {
            console.debug("m_WsConnecter.onMessage:", msg);
            if (!msg) {
                return;
            }
            this.handleMsg(msg);
        });
        this.m_WsConnecter.on("error", (err) => {
            console.warn("m_WsConnecter.onError:", err);
            this.emit("OnError", err);
        });
        this.m_WsConnecter.on("close", (code, reason) => {
            console.warn("m_WsConnecter.onClose:", code, reason);
            this.emit("OnRecognitionComplete");
        });
    }
    async loadAmrFile(file) {
        if (!file) {
            return;
        }
        if (typeof file == "string") {
            let data = await fs_1.default.promises.readFile(file);
            return data;
        }
        else if (file instanceof ReadableStream) {
            const reader = file.getReader();
            let dataBuffer;
            while (true) {
                let { done, value } = await reader.read();
                if (done) {
                    break;
                }
                if (!dataBuffer) {
                    dataBuffer = value;
                }
                else {
                    dataBuffer = Buffer.concat([dataBuffer, value]);
                }
            }
            if (dataBuffer) {
                return dataBuffer;
            }
        }
        else if (file instanceof Buffer) {
            return file;
        }
        else if (file instanceof Uint8Array) {
            return Buffer.from(file);
        }
    }
    async startByAmr(file) {
        if (this.m_OnRunning) {
            console.log("asr is running...");
        }
        this.m_OnRunning = true;
        this.m_AsrType = 2;
        let asrResult;
        try {
            await this.m_WsConnecter.connect(8000);
            let amr = new benz_amr_recorder_1.default();
            let fileData = await this.loadAmrFile(file);
            let pcmdata = await amr.decodeAMRAsync(fileData);
            if (pcmdata) {
                const length = pcmdata.length;
                const buffer = new ArrayBuffer(2 * length);
                const pcmInt16Data = new Int16Array(buffer);
                for (let i = 0; i < length; i++) {
                    pcmInt16Data[i] = Math.max(-32768, Math.min(32767, pcmdata[i] * 32767));
                }
                this.m_WsConnecter.sendData(Buffer.from(pcmInt16Data.buffer));
                this.m_WsConnecter.sendEnd();
                asrResult = await Promise.any([
                    new Promise((resovle, reject) => {
                        setTimeout(() => {
                            resovle("");
                        }, 30000);
                    }),
                    new Promise((resovle, reject) => {
                        this.on("OnSentenceFinal", (text) => {
                            resovle(text);
                        });
                    }),
                ]);
            }
        }
        catch (error) {
            console.error("amr asr error:", error);
        }
        this.m_WsConnecter.stop();
        this.m_OnRunning = false;
        return asrResult;
    }
    async startByMic(deviceId) {
        console.log("startByMic:", deviceId);
        if (this.m_OnRunning) {
            console.log("asr is running...");
        }
        this.m_OnRunning = true;
        this.m_AsrType = 1;
        if (!this.m_WebRecorder) {
            this.m_WebRecorder = new webrecorder_1.WebRecorder(deviceId);
        }
        await this.m_WsConnecter.connect(16000);
        this.m_WebRecorder.OnReceivedData = (data) => {
            if (this.m_WsConnecter) {
                this.m_WsConnecter.sendData(data);
            }
        };
        this.m_WebRecorder.OnError = (err) => {
            this.stop();
            this.emit("error", err);
        };
        this.m_WebRecorder.OnStop = () => {
            this.stop();
        };
        this.m_WebRecorder.start();
    }
    stop() {
        this.m_OnRunning = false;
        if (this.m_WebRecorder) {
            let webRecorder = this.m_WebRecorder;
            this.m_WebRecorder = undefined;
            webRecorder.stop();
        }
        if (this.m_WsConnecter) {
            let wsConnecter = this.m_WsConnecter;
            this.m_WsConnecter = undefined;
            wsConnecter.stop();
        }
    }
    handleMsg(msg) {
        let isBegin = false;
        if (!this.m_RecText.startRec) {
            this.m_RecText.startRec = true;
            isBegin = true;
        }
        if (msg.mode == "2pass-offline" && msg.stamp_sents) {
            for (let stamp of msg.stamp_sents) {
                if (stamp.start > 0) {
                    this.m_RecText.timestamp = stamp.start;
                    break;
                }
            }
            if (this.m_AsrType == 1) {
                this.m_RecText.recText = removeLeadingChinesePunctuation(msg.text);
            }
            else {
                this.m_RecText.recText = msg.text;
                this.m_AmrText += msg.text;
            }
            if (isBegin) {
                this.emit("OnSentenceBegin", this.m_RecText.recText);
            }
            this.emit("OnSentenceEnd", this.m_RecText.recText);
            this.m_RecText = new RecText();
        }
        else {
            this.m_RecText.tempText += msg.text;
            if (isBegin) {
                this.emit("OnSentenceBegin", this.m_RecText.tempText);
            }
            this.emit("OnRecognitionResultChange", this.m_RecText.tempText);
        }
        if (msg.is_final && this.m_AsrType == 2) {
            this.emit("OnSentenceFinal", this.m_AmrText);
            this.m_AmrText = "";
        }
    }
    OnSentenceBegin(callback) {
        this.on("OnSentenceBegin", callback);
    }
    OnRecognitionResultChange(callback) {
        this.on("OnRecognitionResultChange", callback);
    }
    OnSentenceEnd(callback) {
        this.on("OnSentenceEnd", callback);
    }
    OnRecognitionComplete(callback) {
        this.on("OnRecognitionComplete", callback);
    }
    OnError(callback) {
        this.on("OnError", callback);
    }
}
exports.AiAsr = AiAsr;
async function getAsrToken() {
    return (0, RendererHelper_1.invokeToMainProcess)("_getAiAsrToken");
}
class WebSocketConnect extends events_1.EventEmitter {
    constructor() {
        super();
        this.m_isCanSendData = false;
    }
    async connect(audio_fs) {
        if (this.m_SpeechSocket) {
            return;
        }
        let token = await getAsrToken();
        if (!token) {
            console.error("getAsrToken error!");
            return;
        }
        let url = `${WS_ADDRESS}?token=${token}&secretId=${SECRET_ID}`;
        console.debug("WebSocketConnect url:", url);
        return new Promise((resolve, reject) => {
            this.m_SpeechSocket = new ws_1.WebSocket(url);
            this.m_SpeechSocket.on("open", () => {
                var chunk_size = new Array(5, 10, 5);
                var request = {
                    chunk_size: chunk_size,
                    is_speaking: true,
                    mode: "2pass",
                    wav_format: "pcm",
                    audio_fs: audio_fs,
                };
                this.m_SpeechSocket.send(JSON.stringify(request));
                this.m_isCanSendData = true;
                this.emit("open");
                resolve();
            });
            this.m_SpeechSocket.on("error", (err) => {
                this.emit("error", err);
                reject();
            });
            this.m_SpeechSocket.on("message", (data, isBinary) => {
                try {
                    let dataStr = data?.toString();
                    if (dataStr) {
                        this.emit("message", JSON.parse(dataStr));
                    }
                }
                catch (e) {
                    console.warn("解析语音识别数据出错", e);
                }
            });
            this.m_SpeechSocket.on("close", (code, reason) => {
                this.emit("close", code, reason?.toString());
            });
        });
    }
    sendData(data) {
        if (this.m_isCanSendData && this.m_SpeechSocket) {
            this.m_SpeechSocket.send(data);
        }
    }
    sendEnd() {
        if (this.m_isCanSendData && this.m_SpeechSocket) {
            let endData = { is_speaking: false };
            this.m_SpeechSocket.send(JSON.stringify(endData));
        }
    }
    stop() {
        this.sendEnd();
        this.m_isCanSendData = false;
        if (this.m_SpeechSocket) {
            let speechSocket = this.m_SpeechSocket;
            this.m_SpeechSocket = undefined;
            speechSocket.close();
        }
    }
}
const aiAsr = new AiAsr();
function startByAmr(file) {
    const asr = new AiAsr();
    return asr.startByAmr(file);
}
function startByMic(devId) {
    return aiAsr.startByMic(devId);
}
function stop() {
    return aiAsr.stop();
}
electron_1.contextBridge.exposeInMainWorld("AsrHelper", {
    startByAmr,
    startByMic,
    stop,
});
//# sourceMappingURL=AiAsrHelper.js.map
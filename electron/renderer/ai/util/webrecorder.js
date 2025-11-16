"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRecorder = exports.to16kHz = exports.to16BitPCM = void 0;
function to16BitPCM(input) {
    const dataLength = input.length * (16 / 8);
    const dataBuffer = new ArrayBuffer(dataLength);
    const dataView = new DataView(dataBuffer);
    let offset = 0;
    for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return dataView;
}
exports.to16BitPCM = to16BitPCM;
function to16kHz(audioData, sampleRate = 44100) {
    const data = new Float32Array(audioData);
    const fitCount = Math.round(data.length * (16000 / sampleRate));
    const newData = new Float32Array(fitCount);
    const springFactor = (data.length - 1) / (fitCount - 1);
    newData[0] = data[0];
    for (let i = 1; i < fitCount - 1; i++) {
        const tmp = i * springFactor;
        const before = Math.floor(tmp);
        const after = Math.ceil(tmp);
        const atPoint = tmp - before;
        newData[i] = data[before] + (data[after] - data[before]) * atPoint;
    }
    newData[fitCount - 1] = data[data.length - 1];
    return newData;
}
exports.to16kHz = to16kHz;
const audioWorkletCode = `
class MyProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this.audioData = [];
    this.nextUpdateFrame = 40;
    this.sampleCount = 0;
    this.bitCount = 0;
  }

  get intervalInFrames() {
    return 40 / 1000 * sampleRate;
  }

  process(inputs) {
    // 去处理音频数据
    // eslint-disable-next-line no-undef
    if (inputs[0][0]) {
      const output = ${to16kHz}(inputs[0][0], sampleRate);
      this.sampleCount += 1;
      const audioData = ${to16BitPCM}(output);
      this.bitCount += 1;
      const data = [...new Int8Array(audioData.buffer)];
      this.audioData = this.audioData.concat(data);
      this.nextUpdateFrame -= inputs[0][0].length;
      if (this.nextUpdateFrame < 0) {
        this.nextUpdateFrame += this.intervalInFrames;
        this.port.postMessage({
          audioData: new Int8Array(this.audioData),
          sampleCount: this.sampleCount,
          bitCount: this.bitCount
        });
        this.audioData = [];
      }
        return true;
      }
  }
}

registerProcessor('my-processor', MyProcessor);
`;
const audioWorkletBlobURL = window.URL.createObjectURL(new Blob([audioWorkletCode], { type: "text/javascript" }));
const TAG = "WebRecorder";
class WebRecorder {
    constructor(deviceId) {
        this.audioData = [];
        this.allAudioData = [];
        this.stream = null;
        this.audioContext = null;
        this.frameTime = [];
        this.frameCount = 0;
        this.sampleCount = 0;
        this.bitCount = 0;
        this.mediaStreamSource = null;
        this.getDataCount = 0;
        this.audioTrack = null;
        this.deviceId = deviceId;
    }
    static isSupportCreateScriptProcessor(audioContext) {
        return typeof audioContext.createScriptProcessor === "function";
    }
    start() {
        this.frameTime = [];
        this.frameCount = 0;
        this.audioData = [];
        this.sampleCount = 0;
        this.bitCount = 0;
        this.getDataCount = 0;
        this.audioContext = null;
        this.mediaStreamSource = null;
        this.stream = null;
        try {
            this.audioContext = new AudioContext();
        }
        catch (e) {
            console.log("浏览器不支持webAudioApi相关接口", e, TAG);
            this.OnError("浏览器不支持webAudioApi相关接口");
        }
        this.getUserMedia(this.getAudioSuccess, this.getAudioFail);
    }
    stop() {
        this.audioContext && this.audioContext.suspend();
        console.log(`webRecorder stop ${this.sampleCount}/${this.bitCount}/${this.getDataCount}`, JSON.stringify(this.frameTime), TAG);
        this.OnStop();
    }
    destroyStream() {
        if (this.stream) {
            this.stream.getTracks().map((val) => {
                val.stop();
            });
            this.stream = null;
        }
    }
    async getUserMedia(getStreamAudioSuccess, getStreamAudioFail) {
        const mediaOption = {
            audio: true,
            video: false,
        };
        if (this.deviceId) {
            mediaOption.audio = { deviceId: this.deviceId };
        }
        navigator.mediaDevices
            .getUserMedia(mediaOption)
            .then((stream) => {
            this.stream = stream;
            getStreamAudioSuccess.call(this, stream);
        })
            .catch((e) => {
            getStreamAudioFail.call(this, e);
        });
    }
    async getAudioSuccess(stream) {
        if (!this.audioContext) {
            return false;
        }
        if (this.mediaStreamSource) {
            this.mediaStreamSource.disconnect();
            this.mediaStreamSource = null;
        }
        this.audioTrack = stream.getAudioTracks()[0];
        const mediaStream = new MediaStream();
        mediaStream.addTrack(this.audioTrack);
        this.mediaStreamSource =
            this.audioContext.createMediaStreamSource(mediaStream);
        this.audioWorkletNodeDealAudioData(this.mediaStreamSource);
    }
    getAudioFail(err) {
        if (err && err.err && err.err.name === "NotAllowedError") {
            console.log("授权失败", JSON.stringify(err.err), TAG);
        }
        this.OnError(err);
        this.stop();
    }
    scriptNodeDealAudioData() {
        if (WebRecorder.isSupportCreateScriptProcessor(this.audioContext)) {
            const scriptProcessor = this.audioContext.createScriptProcessor(1024, 1, 1);
            this.mediaStreamSource && this.mediaStreamSource.connect(scriptProcessor);
            scriptProcessor && scriptProcessor.connect(this.audioContext.destination);
            scriptProcessor.onaudioprocess = (e) => {
                this.getDataCount += 1;
                const inputData = e.inputBuffer.getChannelData(0);
                const output = to16kHz(inputData, this.audioContext.sampleRate);
                const audioData = to16BitPCM(output);
                this.audioData.push(...new Int8Array(audioData.buffer));
                if (this.audioData.length > 1280) {
                    this.frameTime.push(`${Date.now()}-${this.frameCount}`);
                    this.frameCount += 1;
                    const audioDataArray = new Int8Array(this.audioData);
                    this.OnReceivedData(audioDataArray);
                    this.audioData = [];
                    this.sampleCount += 1;
                    this.bitCount += 1;
                }
            };
        }
        else {
            console.log("不支持createScriptProcessor");
        }
    }
    async audioWorkletNodeDealAudioData(mediaStreamSource) {
        try {
            await this.audioContext.audioWorklet.addModule(audioWorkletBlobURL);
            const myNode = new AudioWorkletNode(this.audioContext, "my-processor", {
                numberOfInputs: 1,
                numberOfOutputs: 1,
                channelCount: 1,
            });
            myNode.onprocessorerror = (event) => {
                this.scriptNodeDealAudioData();
                return false;
            };
            myNode.port.onmessage = (event) => {
                this.frameTime.push(`${Date.now()}-${this.frameCount}`);
                this.OnReceivedData(event.data.audioData);
                this.frameCount += 1;
                this.sampleCount = event.data.sampleCount;
                this.bitCount = event.data.bitCount;
            };
            myNode.port.onmessageerror = (event) => {
                this.scriptNodeDealAudioData();
                return false;
            };
            mediaStreamSource &&
                mediaStreamSource
                    .connect(myNode)
                    .connect(this.audioContext.destination);
        }
        catch (e) {
            this.OnError(e);
        }
    }
    OnReceivedData(data) { }
    OnError(res) { }
    OnStop() { }
}
exports.WebRecorder = WebRecorder;
//# sourceMappingURL=webrecorder.js.map
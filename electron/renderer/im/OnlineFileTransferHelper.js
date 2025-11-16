"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnlineFileTransfer = void 0;
const ws_1 = require("ws");
const events_1 = require("events");
const MainWindowHelper_1 = __importDefault(require("../MainWindowHelper"));
const sleep = (ms => new Promise(resolve => setTimeout(resolve, ms)));
class OnlineFileTransfer extends events_1.EventEmitter {
    constructor(params) {
        super();
        this.isConnecting = false;
        this.connectingPromise = undefined;
        const { channel, puid } = params;
        this.channel = channel;
        this.puid = puid;
    }
    async connect() {
        return new Promise(async (resolve) => {
            const time = Date.now();
            const token = await MainWindowHelper_1.default.genOnlineFileWsToken(this.channel + this.puid + time);
            const url = `wss://transyd.chaoxing.com/channelGroup?channel=${this.channel}&puid=${this.puid}&time=${time}&token=${token}`;
            console.debug("[WebSocket] url:", url);
            this.ws = new ws_1.WebSocket(url);
            const events = ["close", "open", "error", "message"];
            for (const event of events) {
                this.ws.removeAllListeners(event);
            }
            this.ws.on("close", (code, reason) => {
                console.log(`onlineFileTransfer connect close. code:${code}, reason:${reason}`);
                if (code !== 1000) {
                }
                this.ws = undefined;
                this.emit("socketClosed");
            });
            this.ws.on("open", () => {
                console.log("onlineFileTransfer connect success");
                this.isConnecting = false;
                resolve(true);
            });
            this.ws.on("error", (err) => {
                console.error("onlineFileTransfer connect error", err.name, err.message);
                this.isConnecting = false;
                resolve(false);
            });
            this.ws.on("message", (data, isBinary) => {
                console.debug("onlineFileTransfer receive message", data, isBinary);
                const len = data.toString().length;
                if (isBinary) {
                    if (len < 36) {
                        console.error("message length error", len);
                        return;
                    }
                    let fileIdBuffer = data.slice(0, 36);
                    let fileId = fileIdBuffer.toString();
                    this.emit("fileMessage", fileId, data.slice(36));
                }
                else {
                    try {
                        let fileDataStr = JSON.parse(data.toString());
                        this.emit("fileMessage", fileDataStr.fileId, fileDataStr.data);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            });
        });
    }
    async checkConnect() {
        if (!this.ws || this.ws?.readyState !== ws_1.WebSocket.OPEN) {
            await this.connect();
        }
        if (this.ws?.readyState === ws_1.WebSocket.CONNECTING) {
            await sleep(500);
        }
    }
    send(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.checkConnect();
                this.ws.send(data);
            }
            catch (error) {
                reject(error);
            }
            setTimeout(() => {
                resolve(true);
            }, 1);
        });
    }
    sendFileData(fileId, data) {
        if (typeof data === "string") {
            let fileDataStr = { fileId, data: data };
            return this.send(JSON.stringify(fileDataStr));
        }
        else {
            let fileIdBuffer = Buffer.from(fileId);
            let dataBuffer = Buffer.concat([fileIdBuffer, data]);
            return this.send(dataBuffer);
        }
    }
    closeSocket() {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    }
}
exports.OnlineFileTransfer = OnlineFileTransfer;
//# sourceMappingURL=OnlineFileTransferHelper.js.map
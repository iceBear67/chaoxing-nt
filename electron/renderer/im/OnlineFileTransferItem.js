"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFileTransfer = exports.SendFileTransfer = exports.BaseFileTransfer = exports.OnlineFile = exports.TransferFileItem = exports.OnlineFileItem = exports.TransferCmd = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const OnlineFileStream_1 = require("./OnlineFileStream");
const events_1 = require("events");
const MAX_PROGRESS_INTERVAL = 5 * 1024 * 1024;
class TransferCmd {
}
exports.TransferCmd = TransferCmd;
const ComputeSpeedInterval = 1000;
class TransferSpeed extends events_1.EventEmitter {
    constructor(_totalSize) {
        super();
        this.lastTransferBytes = -1;
        this.curTransferBytes = -1;
        this.transferSpeed = -1;
        this.remainder = -1;
        this.totalSize = 0;
        this.totalSize = _totalSize;
        this.calTimeout = setInterval(() => {
            this.calTrnsferSpeed();
        }, ComputeSpeedInterval);
    }
    setTransferBytes(bytes) {
        this.curTransferBytes = bytes;
    }
    calTrnsferSpeed() {
        if (this.curTransferBytes == this.totalSize) {
            clearInterval(this.calTimeout);
            return;
        }
        if (this.curTransferBytes == this.lastTransferBytes) {
            this.transferSpeed = 0;
            this.remainder = -1;
        }
        else {
            this.transferSpeed = this.curTransferBytes - this.lastTransferBytes;
            this.remainder = Math.floor((this.totalSize - this.curTransferBytes) / this.transferSpeed);
            this.lastTransferBytes = this.curTransferBytes;
        }
        let transferSpeedInfo = {
            speed: this.transferSpeed,
            remainder: this.remainder,
        };
        this.emit("transferSpeedChanged", transferSpeedInfo);
    }
    stop() {
        clearInterval(this.calTimeout);
    }
}
class OnlineFileItem {
    constructor() {
        this.isFolder = false;
    }
}
exports.OnlineFileItem = OnlineFileItem;
class TransferFileItem {
    constructor(fileItem, isSender) {
        this.direction = 1;
        this.transferStatus = "waitSendMsg";
        this.failReason = "unknown";
        this.direction = isSender ? 1 : 2;
        if (typeof fileItem == "string") {
            this.onlineFile = new OnlineFile(fileItem);
            this.fileItem = this.onlineFile.toOnlineFileItem();
        }
        else {
            this.transferStatus = "waitingReceive";
            this.fileItem = fileItem;
        }
    }
    startSendTransfer(onlineFileTransfer) {
        this.fileTransfer = new SendFileTransfer(onlineFileTransfer, this);
    }
    startReceiveTransfer(onlineFileTransfer, savePath) {
        this.fileTransfer = new ReceiveFileTransfer(onlineFileTransfer, this, savePath);
    }
    getFileTransfer() {
        return this.fileTransfer;
    }
    getTransferSpeed() {
        return this.fileTransfer?.getTransferSpeed();
    }
    cancelTransfer() {
        this.transferStatus = "canceled";
        this.fileTransfer?.socketClosed();
    }
}
exports.TransferFileItem = TransferFileItem;
class OnlineFile {
    constructor(filePath) {
        this.size = 0;
        this.isFolder = false;
        this.subFiles = [];
        this.localFilePath = filePath;
        this.name = path_1.default.basename(filePath);
        this.id = (0, uuid_1.v4)();
        let stats = fs_1.default.statSync(filePath);
        if (stats.isDirectory()) {
            this.isFolder = true;
            let files = fs_1.default.readdirSync(filePath);
            for (let file of files) {
                let subOnlineFile = new OnlineFile(path_1.default.join(filePath, file));
                this.size += subOnlineFile.size;
                this.subFiles.push(subOnlineFile);
            }
        }
        else {
            this.size = stats.size;
        }
    }
    toOnlineFileItem() {
        let fileItem = new OnlineFileItem();
        fileItem.id = this.id;
        fileItem.name = this.name;
        fileItem.size = this.size;
        fileItem.isFolder = this.isFolder;
        return fileItem;
    }
}
exports.OnlineFile = OnlineFile;
class BaseFileTransfer extends events_1.EventEmitter {
    constructor(onlineFileTransfer, transferFileItem) {
        super();
        this.onlineFileTransfer = onlineFileTransfer;
        this.transferFileItem = transferFileItem;
        this.transferSpeed = new TransferSpeed(transferFileItem.fileItem.size);
        this.transferSpeed.on("transferSpeedChanged", (transferSpeedInfo) => {
            this.emit("transferSpeedChanged", transferSpeedInfo);
        });
    }
    handleFileMessage(data) {
        console.debug("onlineFileTransfer receive file message", data);
        if (typeof data === "string") {
            let fileData = JSON.parse(data);
            return this.handleTextMessage(fileData);
        }
        else {
            return this.handleBinaryMessage(data);
        }
    }
    getTransferSpeed() {
        return this.transferSpeed;
    }
}
exports.BaseFileTransfer = BaseFileTransfer;
class SendFileTransfer extends BaseFileTransfer {
    constructor(onlineFileTransfer, transferFileItem) {
        super(onlineFileTransfer, transferFileItem);
        this.curReceiveLength = 0;
        if (transferFileItem.onlineFile.isFolder) {
            this.sendStream = new OnlineFileStream_1.SendFolderStream(transferFileItem.onlineFile);
        }
        else {
            this.sendStream = new OnlineFileStream_1.SendFileStream(transferFileItem.onlineFile.localFilePath);
        }
        this.sendStream.on("readable", () => {
            if (!this.sendStream.onHandleData) {
                this.sendStream.read();
            }
        });
        this.sendStream.on("data", async (data) => {
            console.debug("send data", data.length);
            this.sendStream.onHandleData = true;
            let sendRet = await this.onlineFileTransfer.sendFileData(transferFileItem.fileItem.id, data);
            if (!sendRet) {
                transferFileItem.transferStatus = "failed";
                transferFileItem.failReason = "unknown";
                this.emit("transferFailed", transferFileItem);
            }
            else {
                setTimeout(() => {
                    this.checkSendSpeed();
                }, 1);
            }
        });
        this.sendStream.on("end", () => {
            transferFileItem.transferStatus = "sendSuccess";
        });
        this.sendStream.on("error", (err) => {
            transferFileItem.transferStatus = "failed";
            transferFileItem.failReason = "unknown";
            this.emit("transferFailed", transferFileItem);
            this.transferSpeed.stop();
        });
    }
    handleTextMessage(msgData) {
        console.debug("receive text message", msgData);
        if (msgData.action == "receiveAck") {
            this.curReceiveLength = msgData.receiveLength;
            this.transferSpeed.setTransferBytes(this.curReceiveLength);
            if (this.curReceiveLength == this.transferFileItem.fileItem.size) {
                this.transferFileItem.transferStatus = "receiveSuccess";
                this.emit("transferSuccess", this.transferFileItem);
            }
            setTimeout(() => {
                this.checkSendSpeed();
            }, 1);
        }
        else if (msgData.action === "CLOSE") {
            this.emit("transferFailed", this.transferFileItem);
        }
        return true;
    }
    handleBinaryMessage(data) {
        return true;
    }
    checkSendSpeed() {
        console.debug("checkSendSpeed......:", this.transferFileItem.transferStatus);
        if (!this.transferFileItem ||
            this.transferFileItem.transferStatus != "transferring") {
            return;
        }
        if (this.needPauseSend()) {
            console.debug("pause send");
        }
        else {
            console.debug("continue send:readable:", this.sendStream.readable);
            if (this.sendStream.readableLength == 0) {
                this.sendStream.onHandleData = false;
            }
            this.sendStream.read();
        }
    }
    needPauseSend() {
        console.debug("needPauseSend:", this.sendStream.getReadLength(), this.curReceiveLength);
        return (this.sendStream.getReadLength() - this.curReceiveLength >
            MAX_PROGRESS_INTERVAL);
    }
    socketClosed() {
        this.transferSpeed.stop();
        this.sendStream.destroy();
    }
}
exports.SendFileTransfer = SendFileTransfer;
class ReceiveFileTransfer extends BaseFileTransfer {
    constructor(onlineFileTransfer, transferFileItem, savePath) {
        super(onlineFileTransfer, transferFileItem);
        if (transferFileItem.fileItem.isFolder) {
            this.receiveStream = new OnlineFileStream_1.ReceiveFolderStream(savePath);
        }
        else {
            this.receiveStream = new OnlineFileStream_1.ReceiveFileStream(savePath, transferFileItem.fileItem.size);
        }
    }
    handleTextMessage(data) {
        if (data.action === "CLOSE") {
            this.emit("transferFailed", this.transferFileItem);
        }
        return true;
    }
    handleBinaryMessage(fileData) {
        console.debug("receive binary message", fileData.length);
        this.receiveStream.write(fileData, (err) => {
            if (!err) {
                let writeLength = this.receiveStream.getWriteLength();
                console.debug("send receiveAck", writeLength);
                this.transferSpeed.setTransferBytes(writeLength);
                this.onlineFileTransfer.sendFileData(this.transferFileItem.fileItem.id, JSON.stringify({
                    action: "receiveAck",
                    receiveLength: writeLength,
                }));
                if (writeLength == this.transferFileItem.fileItem.size) {
                    this.transferFileItem.transferStatus = "receiveSuccess";
                    this.emit("transferSuccess", this.transferFileItem);
                    this.receiveStream.end();
                }
            }
            else {
                this.transferFileItem.transferStatus = "failed";
                this.transferFileItem.failReason = "unknown";
                this.emit("transferFailed", this.transferFileItem);
            }
        });
        return true;
    }
    socketClosed() {
        this.transferSpeed.stop();
        this.receiveStream.destroy();
    }
}
exports.ReceiveFileTransfer = ReceiveFileTransfer;
//# sourceMappingURL=OnlineFileTransferItem.js.map
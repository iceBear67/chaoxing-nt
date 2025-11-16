"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndRenamePath = exports.TransferStatistics = exports.TransferFileStatistic = void 0;
const electron_1 = require("electron");
const events_1 = __importDefault(require("events"));
const OnlineFileTransferItem_1 = require("./OnlineFileTransferItem");
const OnlineFileTransferHelper_1 = require("./OnlineFileTransferHelper");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const FileUtil_1 = require("../../utils/FileUtil");
const MainWindowHelper_1 = __importDefault(require("../MainWindowHelper"));
const lodash_1 = require("lodash");
const MAX_SINGLE_TRANSFER_FILE_COUNT = 5;
const m_EventEmitter = new events_1.default();
let m_myHxUid = "";
let m_myPuid = "";
let m_SendMessageFun;
let m_TranslateFun;
let m_CreateNewMessage;
const m_fileIdToSavePath = new Map();
const m_fileIdToLocalPath = new Map();
function setSendCmdMessageFun(fun) {
    m_SendMessageFun = fun;
}
function setTranslateFun(fun) {
    m_TranslateFun = fun;
}
function setCreateNewMessageFun(fun) {
    m_CreateNewMessage = fun;
}
function checkFileAvailable(taskId, fileId) {
    const task = getTransferTask(taskId);
    return task.getOnlineFileItem(fileId) !== undefined;
}
function handleOnlineFileMessage(msg) {
    console.log("handleOnlineFileMessage", JSON.stringify(msg));
    if (msg.type == "txt") {
        if (msg.ext?.onlineFileInfo) {
            addReceiveFile(msg.from, msg.ext.onlineFileInfo, msg.id);
        }
    }
    else {
        if (msg.ext?.action == "ONLINE_FILE_RECEIVE") {
            let fileId = msg.ext?.fileId;
            const isAvailable = checkFileAvailable(msg.from, fileId);
            if (isAvailable === false) {
                m_SendMessageFun({
                    chatType: "singleChat",
                    type: "cmd",
                    from: m_myHxUid,
                    to: msg.from,
                    action: "CMD_ONLINE_FILE_OPER",
                    ext: {
                        action: "ONLINE_FILE_CLOSE",
                        fileId,
                    },
                });
            }
            else {
                preSendOnlineFile(msg.from, fileId);
            }
        }
        else if (msg.ext?.action == "ONLINE_FILE_REJECT") {
            let fileId = msg.ext?.fileId;
            const time = Date.now();
            const task = getTransferTask(msg.from);
            const { onlineFile } = task.getOnlineFileItem(fileId);
            const { name, size } = onlineFile;
            const options = {
                msg: m_TranslateFun("transferFile.rejectOnlineFileTipMessage", {
                    operator: m_TranslateFun("transferFile.theOtherParty"),
                    fileName: name,
                    fileSize: size,
                }),
                from: msg.from,
                to: msg.to,
                time,
                onlineState: 1,
                chatType: "singleChat",
                type: "txt",
                id: `-1${time}`,
                ext: {
                    onlineFileRejectReceive: true,
                    onlineFileInfo: (0, lodash_1.omit)(onlineFile, "subFiles"),
                },
            };
            m_CreateNewMessage(options);
            deleteTransferFileInfo(msg.from, fileId);
        }
        else if (msg.ext?.action == "ONLINE_FILE_CANCEL") {
            let fileId = msg.ext?.fileId;
            let task = getTransferTask(msg.from);
            const time = Date.now();
            const { fileItem } = task.getOnlineFileItem(fileId);
            const { name, size } = fileItem;
            const options = {
                msg: m_TranslateFun("transferFile.stopSendFileTipMessage", {
                    operator: m_TranslateFun("transferFile.theOtherParty"),
                    fileName: name,
                    fileSize: size,
                }),
                from: msg.from,
                to: msg.to,
                time,
                onlineState: 1,
                chatType: "singleChat",
                type: "txt",
                id: `-1${time}`,
                ext: {
                    onlineFileCancelSending: true,
                    onlineFileInfo: fileItem,
                },
            };
            m_CreateNewMessage(options);
            task.canccelTransferFile(fileId);
        }
        else if (msg.ext?.action === "ONLINE_FILE_TO_OFFLINE_SENDING") {
            const fileId = msg.ext.fileId;
            const isSelfSend = msg.from === m_myHxUid;
            if (isSelfSend) {
                const task = getTransferTask(msg.to);
                const item = task.getOnlineFileItem(fileId);
                if (item.direction === 1) {
                    task.sendEvent("toOfflineSending", fileId);
                }
                else if (item.direction === 2) {
                    console.log("自己移动端点击了转离线接收");
                    deleteTransferFileInfo(msg.to, fileId);
                }
            }
            else {
                const task = getTransferTask(msg.from);
                const item = task.getOnlineFileItem(fileId);
                if (item.direction === 1) {
                    console.log("对方点击了转离线接收");
                    task.sendEvent("toOfflineSending", fileId);
                }
                else if (item.direction === 2) {
                    console.log("对方点击了转离线发送");
                    const time = Date.now();
                    const options = {
                        from: msg.from,
                        to: m_myHxUid,
                        msg: m_TranslateFun("transferFile.toOfflineSendTipMessage", {
                            operator: m_TranslateFun("transferFile.theOtherParty"),
                            fileName: item.fileItem.name,
                            fileSize: item.fileItem.size,
                        }),
                        ext: {
                            onlineFileInfo: item.fileItem,
                            onlineFileToOfflineSending: true,
                        },
                        id: `-1${time}`,
                        time,
                        chatType: "singleChat",
                        onlineState: 1,
                        type: "txt",
                    };
                    m_CreateNewMessage(options);
                    deleteTransferFileInfo(msg.from, fileId);
                }
            }
        }
        else if (msg.ext?.action === "ONLINE_FILE_CLOSE") {
            const task = getTransferTask(msg.from);
            task.sendEvent("close", msg.ext.fileId);
        }
    }
}
class TransferFileStatistic {
    constructor() {
        this.files = [];
        this.fileCount = 0;
        this.fileType = 0;
        this.fileSize = 0;
        this.transferBytes = 0;
        this.transferSpeed = 0;
        this.remainderTime = 0;
    }
    addFileItem(transItem) {
        this.fileCount++;
        let fileItem = transItem.fileItem;
        this.fileSize += fileItem.size;
        this.files.push((0, lodash_1.omit)(fileItem, ["localPath"]));
        let tempType = fileItem.isFolder ? 2 : 1;
        if (this.fileType == 0) {
            this.fileType = tempType;
        }
        else {
            if (tempType != this.fileType) {
                this.fileType = 3;
            }
        }
        if (transItem.transferStatus == "transferring") {
            this.transferBytes += transItem.getTransferSpeed()?.curTransferBytes || 0;
            this.transferSpeed += transItem.getTransferSpeed()?.transferSpeed || 0;
        }
        if (this.transferSpeed != 0) {
            this.remainderTime =
                (this.fileSize - this.transferBytes) / this.transferSpeed;
        }
    }
}
exports.TransferFileStatistic = TransferFileStatistic;
class TransferStatistics {
    constructor() {
        this.waitSendStatistic = new TransferFileStatistic();
        this.waitOtherReceiveStatistic = new TransferFileStatistic();
        this.waitSelfReceiveStatistic = new TransferFileStatistic();
        this.sendingStatistic = new TransferFileStatistic();
        this.receivingStatistic = new TransferFileStatistic();
    }
}
exports.TransferStatistics = TransferStatistics;
class TransferTask {
    constructor(id) {
        this.transferFileItems = [];
        this.id = id;
        const params = this.buildParams();
        this.onlineFileTransfer = new OnlineFileTransferHelper_1.OnlineFileTransfer(params);
        this.onlineFileTransfer.on("fileMessage", (fileId, fileData) => {
            let transferFileItem = this.getOnlineFileItem(fileId);
            if (transferFileItem?.fileTransfer) {
                transferFileItem.fileTransfer.handleFileMessage(fileData);
            }
        });
    }
    sendFileData(fileId, data) {
        return this.onlineFileTransfer.sendFileData(fileId, data);
    }
    addOnlineFileItem(onlineFileItem, messageId) {
        if (!this.isExistFile(onlineFileItem.id, undefined)) {
            const item = new OnlineFileTransferItem_1.TransferFileItem(onlineFileItem, false);
            item.serverMessageId = messageId;
            this.transferFileItems.push(item);
        }
    }
    addOnlineFile(filePath) {
        if (!this.isExistFile(undefined, filePath)) {
            const item = new OnlineFileTransferItem_1.TransferFileItem(filePath, true);
            this.transferFileItems.push(item);
            m_fileIdToLocalPath.set(item.onlineFile.id, item.onlineFile.localFilePath);
            m_SendMessageFun({
                chatType: "singleChat",
                type: "txt",
                from: m_myHxUid,
                to: this.id,
                msg: `[${m_TranslateFun("transferFile.onlineFile")}]${item.fileItem.name}`,
                ext: {
                    time: String(Date.now()),
                    sendOnlineFile2: true,
                    onlineFileInfo: item.fileItem,
                },
            }).then(({ serverMsgId }) => {
                item.serverMessageId = serverMsgId;
            });
        }
    }
    isExistFile(fileId, filePath) {
        if (fileId) {
            return this.transferFileItems.some((item) => item.fileItem.id == fileId);
        }
        return this.transferFileItems.some((item) => item.onlineFile?.localFilePath == filePath);
    }
    getOnlineFileItem(fileId) {
        return this.transferFileItems.find((item) => item.fileItem.id == fileId);
    }
    deleteOnlineFileItem(fileId) {
        let index = this.transferFileItems.findIndex((transferFileItem) => {
            if (transferFileItem.fileItem.id == fileId) {
                return true;
            }
        });
        if (index > -1) {
            this.transferFileItems.splice(index, 1);
        }
        this.updateTransferStatistics();
    }
    getOnlineFilesItems(status) {
        let onlineFilesItems = [];
        for (let transferFileItem of this.transferFileItems) {
            if (status) {
                if (transferFileItem.transferStatus == status) {
                    onlineFilesItems.push(transferFileItem.fileItem);
                }
            }
            else {
                onlineFilesItems.push(transferFileItem.fileItem);
            }
        }
        return onlineFilesItems;
    }
    getTransferFilesItems() {
        return this.transferFileItems;
    }
    getTransferStatistics() {
        let transferStatistics = new TransferStatistics();
        for (let transferFileItem of this.transferFileItems) {
            if (transferFileItem.transferStatus == "waitingReceive" ||
                transferFileItem.transferStatus == "waitSendMsg") {
                if (transferFileItem.direction == 1) {
                    transferStatistics.waitOtherReceiveStatistic.addFileItem(transferFileItem);
                }
                else {
                    transferStatistics.waitSelfReceiveStatistic.addFileItem(transferFileItem);
                }
            }
            else if (transferFileItem.transferStatus == "waitingSend") {
                transferStatistics.waitSendStatistic.addFileItem(transferFileItem);
            }
            else if (transferFileItem.transferStatus == "transferring" ||
                transferFileItem.transferStatus == "sendSuccess") {
                if (transferFileItem.direction == 1) {
                    transferStatistics.sendingStatistic.addFileItem(transferFileItem);
                }
                else {
                    transferStatistics.receivingStatistic.addFileItem(transferFileItem);
                }
            }
        }
        return transferStatistics;
    }
    getTransferringFileCount() {
        let count = 0;
        for (let transferFileItem of this.transferFileItems) {
            if (transferFileItem.transferStatus == "transferring") {
                count++;
            }
        }
        return count;
    }
    createChannelId() {
        let uids = [m_myHxUid, this.id];
        uids.sort();
        return uids.join("-");
    }
    buildParams() {
        const channel = this.createChannelId();
        const puid = m_myPuid;
        return {
            channel,
            puid,
        };
    }
    async preSendOnlineFile(fileId) {
        let transferFileItem = this.getOnlineFileItem(fileId);
        if (transferFileItem) {
            transferFileItem.transferStatus = "waitingSend";
            await this.checkSendFile();
        }
    }
    async checkSendFile() {
        let transferringCount = this.getTransferringFileCount();
        if (transferringCount >= MAX_SINGLE_TRANSFER_FILE_COUNT) {
            return;
        }
        for (let transferFileItem of this.transferFileItems) {
            if (transferFileItem.transferStatus == "waitingSend") {
                transferFileItem.transferStatus = "transferring";
                await this.startSendFile(transferFileItem);
            }
        }
    }
    async startSendFile(transferFileItem) {
        await this.onlineFileTransfer.checkConnect();
        transferFileItem.startSendTransfer(this);
        this.updateTransferFileInfo(transferFileItem);
    }
    async receiveTransferFile(fileId, savePath) {
        let transferFileItem = this.getOnlineFileItem(fileId);
        savePath = path_1.default.join(savePath, transferFileItem.fileItem.name);
        savePath = checkAndRenamePath(savePath);
        console.log("receiveTransferFile", fileId, savePath);
        m_fileIdToSavePath.set(fileId, savePath);
        if (transferFileItem) {
            transferFileItem.savePath = savePath;
            transferFileItem.fileItem.localPath = savePath;
            transferFileItem.transferStatus = "transferring";
            await this.onlineFileTransfer.checkConnect();
            transferFileItem.startReceiveTransfer(this, savePath);
            this.onlineFileTransfer.once("socketClosed", () => {
                transferFileItem.fileTransfer;
            });
            this.updateTransferFileInfo(transferFileItem);
        }
    }
    updateTransferFileInfo(transferFileItem) {
        transferFileItem.fileTransfer.on("transferFailed", () => {
            if (transferFileItem.direction == 2 && transferFileItem.savePath) {
                (0, FileUtil_1.deleteDirAsync)(transferFileItem.savePath);
            }
            this.sendEvent("transferFailed", transferFileItem.fileItem);
            this.deleteOnlineFileItem(transferFileItem.fileItem.id);
            this.checkSendFile();
            transferFileItem
                .getFileTransfer()
                ?.removeAllListeners("transferSpeedChanged");
            this.updateTransferStatistics();
            if (!this.hasTransferFile()) {
                setTimeout(() => {
                    this.checkCloseSocket();
                }, 100);
            }
        });
        transferFileItem.fileTransfer.on("transferSuccess", () => {
            this.sendEvent("transferSuccess", transferFileItem.fileItem);
            this.deleteOnlineFileItem(transferFileItem.fileItem.id);
            this.checkSendFile();
            transferFileItem
                .getFileTransfer()
                ?.removeAllListeners("transferSpeedChanged");
            this.updateTransferStatistics();
            if (!this.hasTransferFile()) {
                setTimeout(() => {
                    this.checkCloseSocket();
                }, 100);
            }
        });
        transferFileItem
            .getFileTransfer()
            ?.on("transferSpeedChanged", (transferSpeedInfo) => {
            this.updateTransferStatistics();
        });
        this.updateTransferStatistics();
    }
    updateTransferStatistics() {
        let transferStatistics = this.getTransferStatistics();
        this.sendEvent("updateStatistics", transferStatistics);
    }
    hasTransferFile() {
        for (let transferFileItem of this.transferFileItems) {
            if (transferFileItem.transferStatus == "waitingSend" ||
                transferFileItem.transferStatus == "transferring" ||
                transferFileItem.transferStatus == "sendSuccess") {
                return true;
            }
        }
    }
    checkCloseSocket() {
        if (!this.hasTransferFile()) {
            this.onlineFileTransfer.closeSocket();
        }
    }
    sendEvent(event, ...args) {
        m_EventEmitter.emit(`${event}_${this.id}`, ...args);
    }
    canccelTransferFile(fileId) {
        let transferFileItem = this.getOnlineFileItem(fileId);
        if (transferFileItem) {
            transferFileItem.cancelTransfer();
            this.deleteOnlineFileItem(fileId);
        }
    }
    getServerMessageId(fileId) {
        const found = this.transferFileItems.find((item) => item.fileItem.id === fileId);
        return found?.serverMessageId;
    }
}
const m_TransferTaskMap = new Map();
function getTransferTask(id) {
    if (!m_TransferTaskMap.has(id)) {
        m_TransferTaskMap.set(id, new TransferTask(id));
    }
    return m_TransferTaskMap.get(id);
}
function addSendFiles(to, filePaths) {
    let task = getTransferTask(to);
    for (let filePath of filePaths) {
        task.addOnlineFile(filePath);
    }
    task.updateTransferStatistics();
}
function addReceiveFile(from, fileItem, messageId) {
    let task = getTransferTask(from);
    task.addOnlineFileItem(fileItem, messageId);
}
function deleteTransferTask(taskId) {
    m_TransferTaskMap.delete(taskId);
}
function getAllTransferringFileCount() {
    let count = 0;
    for (let [key, value] of m_TransferTaskMap) {
        count += value.getTransferringFileCount();
    }
    return count;
}
function getTransferFileInfo(taskId, fileId) {
    let task = getTransferTask(taskId);
    return task.getOnlineFileItem(fileId);
}
function deleteTransferFileInfo(taskId, fileId) {
    let task = getTransferTask(taskId);
    task.deleteOnlineFileItem(fileId);
}
function afterSendTransferFileMsg(taskId, fileId) {
    let task = getTransferTask(taskId);
    if (task) {
        task.getOnlineFileItem(fileId).transferStatus = "waitingReceive";
    }
}
function getTransferStatistics(taskId) {
    let task = getTransferTask(taskId);
    return task.getTransferStatistics();
}
async function receiveTransferFile(taskId, fileId, savePath) {
    let task = getTransferTask(taskId);
    const msgId = task.getServerMessageId(fileId);
    const defaultSavePath = await MainWindowHelper_1.default.getDownloadPath();
    const actualSavePath = savePath || defaultSavePath;
    await task.receiveTransferFile(fileId, actualSavePath);
    if (m_SendMessageFun) {
        const chatType = "singleChat";
        const type = "cmd";
        const from = m_myHxUid;
        const action = "CMD_ONLINE_FILE_OPER";
        const extAction = "ONLINE_FILE_RECEIVE";
        m_SendMessageFun({
            chatType,
            type,
            from,
            to: taskId,
            action,
            ext: {
                action: extAction,
                fileId,
                msgId,
            },
        });
        m_SendMessageFun({
            chatType,
            type,
            from,
            to: m_myHxUid,
            action,
            ext: {
                action: extAction,
                fileId,
                msgId,
            },
        });
    }
}
function cancelTransferFile(taskId, fileId) {
    let task = getTransferTask(taskId);
    const msgId = task.getServerMessageId(fileId);
    if (m_SendMessageFun) {
        m_SendMessageFun({
            chatType: "singleChat",
            type: "cmd",
            from: m_myHxUid,
            to: taskId,
            action: "CMD_ONLINE_FILE_OPER",
            ext: {
                action: "ONLINE_FILE_CANCEL",
                fileId: fileId,
                msgId,
            },
        });
        m_SendMessageFun({
            chatType: "singleChat",
            type: "cmd",
            from: m_myHxUid,
            to: m_myHxUid,
            action: "CMD_ONLINE_FILE_OPER",
            ext: {
                action: "ONLINE_FILE_CANCEL",
                fileId: fileId,
                msgId,
            },
        });
        const { onlineFile } = task.getOnlineFileItem(fileId);
        const { name, size } = onlineFile;
        const time = Date.now();
        const options = {
            msg: m_TranslateFun("transferFile.stopSendFileTipMessage", {
                operator: m_TranslateFun("transferFile.you"),
                fileName: name,
                fileSize: size,
            }),
            from: m_myHxUid,
            to: taskId,
            chatType: "singleChat",
            ext: {
                onlineFileCancelSending: true,
                onlineFileInfo: (0, lodash_1.omit)(onlineFile, "subFiles"),
            },
            time,
            id: `-1${time}`,
            type: "txt",
            onlineState: 1,
        };
        m_CreateNewMessage(options);
        task.canccelTransferFile(fileId);
    }
}
function rejectTransferFile(taskId, fileId) {
    let task = getTransferTask(taskId);
    const msgId = task.getServerMessageId(fileId);
    if (m_SendMessageFun) {
        const chatType = "singleChat";
        const type = "cmd";
        const from = m_myHxUid;
        const action = "CMD_ONLINE_FILE_OPER";
        const extAction = "ONLINE_FILE_REJECT";
        m_SendMessageFun({
            chatType,
            type,
            from,
            to: taskId,
            action,
            ext: {
                action: extAction,
                fileId,
                msgId,
            },
        });
        m_SendMessageFun({
            chatType,
            type,
            from,
            to: m_myHxUid,
            action,
            ext: {
                action: extAction,
                fileId,
                msgId,
            },
        });
    }
    const time = Date.now();
    const { fileItem } = task.getOnlineFileItem(fileId);
    const { name, size } = fileItem;
    const options = {
        msg: m_TranslateFun("transferFile.rejectOnlineFileTipMessage", {
            operator: m_TranslateFun("transferFile.you"),
            fileName: name,
            fileSize: size,
        }),
        from: m_myHxUid,
        to: taskId,
        time,
        onlineState: 1,
        chatType: "singleChat",
        type: "txt",
        id: `-1${time}`,
        ext: {
            onlineFileRejectReceive: true,
            onlineFileInfo: fileItem,
        },
    };
    m_CreateNewMessage(options);
    task.deleteOnlineFileItem(fileId);
}
function preSendOnlineFile(taskId, fileId) {
    let task = getTransferTask(taskId);
    task.preSendOnlineFile(fileId);
}
function updateMyHxUid(hxUid) {
    console.log("updateMyHxUid", hxUid);
    m_myHxUid = hxUid;
}
function updateMyPuid(puid) {
    console.log("updateMyPuid", puid);
    m_myPuid = puid;
}
function onEvent(id, event, callback) {
    m_EventEmitter.on(`${event}_${id}`, callback);
}
function offEvent(id, event) {
    m_EventEmitter.removeAllListeners(`${event}_${id}`);
}
function checkAndRenamePath(oldPath) {
    let dir = path_1.default.dirname(oldPath);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    if (!fs_1.default.existsSync(dir)) {
        return null;
    }
    let filePath = oldPath;
    let extname = path_1.default.extname(oldPath);
    let basename = path_1.default.basename(oldPath, extname);
    let tempIndex = 2;
    while (true) {
        if (fs_1.default.existsSync(filePath)) {
            let filename2 = `${basename}(${tempIndex++})${extname}`;
            filePath = path_1.default.join(dir, filename2);
            continue;
        }
        break;
    }
    return filePath;
}
exports.checkAndRenamePath = checkAndRenamePath;
function getFileLocalPath(fileId) {
    return m_fileIdToLocalPath.get(fileId);
}
function getFileSavePath(fileId) {
    return m_fileIdToSavePath.get(fileId);
}
function getServerMessageId(taskId, fileId) {
    const task = getTransferTask(taskId);
    return task.getServerMessageId(fileId);
}
electron_1.contextBridge.exposeInMainWorld("OnlineFileHelper", {
    addSendFiles,
    deleteTransferTask,
    getTransferStatistics,
    afterSendTransferFileMsg,
    getTransferFileInfo,
    deleteTransferFileInfo,
    updateMyHxUid,
    onEvent,
    offEvent,
    receiveTransferFile,
    rejectTransferFile,
    cancelTransferFile,
    setSendCmdMessageFun,
    handleOnlineFileMessage,
    setTranslateFun,
    setCreateNewMessageFun,
    getFileSavePath,
    getFileLocalPath,
    updateMyPuid,
    getServerMessageId,
});
//# sourceMappingURL=OnlineFileHelper.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHideCloundDiskFolder = exports.createHideCloundDiskFolderByFolderInfo = exports.uploadSubFolderToCloudDisk = exports.uploadFolderToCloudDisk = exports.uploadFileChunk = exports.uploadFileToCloudDiskSplit = exports.uploadFileToCloudDiskSingle = exports.uploadFileToCloudDisk = exports.getGroupFileInFolderOnPage = exports.getGroupFileInFolder = exports.getDownloadUrl = exports.getFileInFolder = void 0;
const electron_1 = require("electron");
const UserHelper_1 = require("./UserHelper");
const url_1 = require("url");
const TokenUtil_1 = require("../utils/TokenUtil");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const CryptoUtil_1 = require("../utils/CryptoUtil");
const NetUtil_1 = require("./util/NetUtil");
const CLOUD_PAN_DOMAIN = "https://pan-yz.chaoxing.com";
const CLOUD_TOKEN_URL = `${CLOUD_PAN_DOMAIN}/api/token/uservalid`;
const CLOUD_GET_FILE_PATH_IN_FOLDER = `${CLOUD_PAN_DOMAIN}/api/getFileRelativePathInFolder`;
const CLOUD_GET_SHARE_FILE_PATH_IN_FOLDER = `${CLOUD_PAN_DOMAIN}/api/sharepan/getFileRelativePathInFolder`;
const GROUP_CLOUD_GET_FILE_PATH_IN_FOLDER = `https://resource.chaoxing.com/apis/cloud/getRecsForDownLoad.jspx`;
const CLOUD_GET_DOWNLOAD_URL = `${CLOUD_PAN_DOMAIN}/api/getDownloadUrl`;
const CLOUD_GET_DOWNLOAD_SHARE_URL = `${CLOUD_PAN_DOMAIN}/api/share/downloadUrl`;
const UPLOAD_FILE_URL = `${CLOUD_PAN_DOMAIN}/upload/uploadfile`;
const UPLOAD_FILE_CRC = `${CLOUD_PAN_DOMAIN}/upload/chunk/calcFileCRC`;
const UPLOAD_FILE_INIT_TASK = `${CLOUD_PAN_DOMAIN}/upload/chunk/initTask`;
const CREATE_CLOUD_FOLDER_URL = `${CLOUD_PAN_DOMAIN}/api/newfld`;
const CREATE_CLOUD_SHARE_URL = `${CLOUD_PAN_DOMAIN}/api/share/create`;
const CLOUD_GET_VIDEO_PLAY_URL = `${CLOUD_PAN_DOMAIN}/api/media/info`;
const CLOUD_GET_EXT_FILE_INFO = `${CLOUD_PAN_DOMAIN}/api/extfilesInfo`;
const CLOUD_GET_SUPPORT_PREVIEW_SUFFIX = `${CLOUD_PAN_DOMAIN}/api/getSupportPreviewSuffix`;
const CLOUD_GET_DOWNLOADuRL_BY_OBJECTID = `${CLOUD_PAN_DOMAIN}/api/objectid2DownloadUrl`;
const CLOUD_GET_ATT_BELONGER = `${CLOUD_PAN_DOMAIN}/api/belonger`;
const DEFAULT_PAGE_SIZE = 100;
function loadToken() {
    let pms = new Promise((resolve, reject) => {
        if ((0, UserHelper_1.getPanToken)()) {
            resolve((0, UserHelper_1.getPanToken)());
            return;
        }
        const request = electron_1.net.request({
            url: CLOUD_TOKEN_URL,
            useSessionCookies: true,
        });
        request.on("response", (response) => {
            console.log(`loadToken STATUS: ${response.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
            response.on("data", (chunk) => {
                console.log(`BODY: ${chunk}`);
                let data = JSON.parse(chunk.toString());
                if (data.result) {
                    (0, UserHelper_1.setPanToken)(data._token);
                    resolve(data._token);
                }
            });
            response.on("end", () => {
                console.log("No more data in response.");
            });
        });
        request.end();
    });
    return pms;
}
class UploadFileInfo {
    constructor(uploadId) {
        this.uploadId = uploadId;
    }
    cancelUpload() {
        this.canceled = true;
        if (this.fileStream && this.fileStream.readable) {
            this.fileStream.close();
        }
        if (this.request) {
            this.request.abort();
        }
    }
}
class UploadFileInfoMap {
    static getUploadFileInfo(uploadId) {
        return UploadFileInfoMap.uploadFileInfoMap.get(uploadId);
    }
    static addUploadFileInfoById(uploadId) {
        let uploadFileInfo = new UploadFileInfo(uploadId);
        UploadFileInfoMap.addUploadFileInfo(uploadFileInfo);
    }
    static removeUploadFileInfo(uploadId) {
        return UploadFileInfoMap.uploadFileInfoMap.delete(uploadId);
    }
    static addUploadFileInfo(uploadFileInfo) {
        return UploadFileInfoMap.uploadFileInfoMap.set(uploadFileInfo.uploadId, uploadFileInfo);
    }
}
UploadFileInfoMap.uploadFileInfoMap = new Map();
async function getFileInFolder(args) {
    let dataList = new Array();
    let res = await getFileInFolderOnPage(args, dataList, "0");
    while (res.success && res.lastId) {
        res = await getFileInFolderOnPage(args, dataList, res.lastId);
    }
    if (res.success) {
        return dataList;
    }
    return undefined;
}
exports.getFileInFolder = getFileInFolder;
function getFileInFolderOnPage(args, dataList, lastId) {
    return loadToken().then((token) => {
        if (!token) {
            return { success: false };
        }
        let puid = args.puid;
        if (!puid) {
            puid = (0, UserHelper_1.getUID)();
        }
        if (!puid) {
            return { success: false };
        }
        let usp = new url_1.URLSearchParams();
        usp.append("puid", puid);
        if (args.shareUserId) {
            usp.append("shareUserId", args.shareUserId);
        }
        usp.append("fldid", args.fodlerId);
        usp.append("showHideFile", "1");
        usp.append("showAll", "1");
        usp.append("lastId", lastId);
        usp.append("pageSize", DEFAULT_PAGE_SIZE + "");
        let url;
        if (args.isSharePan && args.fid) {
            url = new url_1.URL(CLOUD_GET_SHARE_FILE_PATH_IN_FOLDER);
            usp.append("fid", args.fid);
        }
        else {
            url = new url_1.URL(CLOUD_GET_FILE_PATH_IN_FOLDER);
        }
        if (args.shareId) {
            usp.append("shareId", args.shareId);
        }
        usp.append("_token", token);
        url.search = usp.toString();
        console.log("url:", url.toString());
        return new Promise((resolve, reject) => {
            const request = electron_1.net.request({
                url: url.toString(),
                useSessionCookies: true,
            });
            let responseBuf;
            request.on("response", (response) => {
                console.log(`loadToken STATUS: ${response.statusCode}`);
                if (response.statusCode != 200) {
                    resolve({ success: false });
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    console.log("No more data in response.");
                    console.log(`BODY: ${responseBuf}`);
                    let resData = JSON.parse(responseBuf.toString());
                    console.debug("getFileInFolderOnPage,response:", resData);
                    if (resData.result) {
                        let totalCount = resData.totalCount;
                        let data = resData.data;
                        dataList.push(...data);
                        if (dataList.length >= totalCount ||
                            data.length < DEFAULT_PAGE_SIZE) {
                            resolve({ success: true });
                        }
                        else {
                            resolve({ success: true, lastId: data[data.length - 1].resid });
                        }
                    }
                    else {
                        resolve({ success: false });
                    }
                });
            });
            request.end();
        });
    });
}
async function getDownloadUrl(fleid, sharepuid, objectId) {
    return loadToken().then((token) => {
        if (!token) {
            return undefined;
        }
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return undefined;
        }
        let usp = new url_1.URLSearchParams();
        usp.append("puid", puid);
        usp.append("_token", token);
        let url = new url_1.URL(CLOUD_GET_DOWNLOAD_URL);
        if (fleid) {
            usp.append("fleid", fleid);
            url = new url_1.URL(CLOUD_GET_DOWNLOAD_URL);
        }
        else {
            usp.append("objectid", objectId);
            url = new url_1.URL(CLOUD_GET_DOWNLOADuRL_BY_OBJECTID);
        }
        if (sharepuid != puid) {
            url = new url_1.URL(CLOUD_GET_DOWNLOAD_SHARE_URL);
            usp.append("sarepuid", sharepuid);
        }
        url.search = usp.toString();
        console.log("get download url:", url.toString());
        return new Promise((resolve, reject) => {
            const request = electron_1.net.request({
                url: url.toString(),
                useSessionCookies: true,
            });
            let responseBuf;
            request.on("response", (response) => {
                console.log(`loadToken STATUS: ${response.statusCode}`);
                if (response.statusCode != 200) {
                    resolve(undefined);
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    console.debug("No more data in response.");
                    console.debug(`BODY: ${responseBuf}`);
                    let resData = JSON.parse(responseBuf.toString());
                    console.debug("getDownloadUrl,response:", resData);
                    if (resData.result && resData.data) {
                        let fileItem = {
                            url: resData.url,
                            resid: resData.data?.resid + "",
                            name: resData.data?.name,
                            size: resData.data?.size,
                        };
                        resolve(fileItem);
                    }
                    else {
                        resolve(resData);
                    }
                });
            });
            request.end();
        });
    });
}
exports.getDownloadUrl = getDownloadUrl;
async function getGroupFileInFolder(args) {
    let dataList = new Array();
    let res = { success: true, hasMore: true };
    let page = 1;
    while (res.success && res.hasMore) {
        res = await getGroupFileInFolderOnPage(args, dataList, page++, 1000);
    }
    if (res.success) {
        return dataList;
    }
    return undefined;
}
exports.getGroupFileInFolder = getGroupFileInFolder;
function getGroupFileInFolderOnPage(args, dataList, page, pageSize) {
    let urlParms = TokenUtil_1.TokenUtil.getRequestParams({
        url: "",
        getParams: {
            ownertype: "1",
            ownerId: args.ownerId,
            pid: args.pid,
            page: page + "",
            pageSize: pageSize + "",
        },
        tokenSign: true,
    });
    let url = new url_1.URL(`${GROUP_CLOUD_GET_FILE_PATH_IN_FOLDER}${urlParms}`);
    console.log("url:", url.toString());
    return new Promise((resolve, reject) => {
        const request = electron_1.net.request({
            url: url.toString(),
            useSessionCookies: true,
        });
        let responseBuf;
        request.on("response", (response) => {
            console.log(`loadToken STATUS: ${response.statusCode}`);
            if (response.statusCode != 200) {
                resolve({ success: false, hasMore: false });
                return;
            }
            response.on("data", (chunk) => {
                if (responseBuf) {
                    responseBuf = Buffer.concat([responseBuf, chunk]);
                }
                else {
                    responseBuf = chunk;
                }
            });
            response.on("end", () => {
                console.log("No more data in response.");
                console.debug(`BODY: ${responseBuf}`);
                let resData = JSON.parse(responseBuf.toString());
                console.debug("getGroupFileInFolderOnPage,response:", resData);
                if (resData.result && resData.data) {
                    let pageCount = resData.data.pageCount;
                    let datas = resData.data.list;
                    for (let dataItem of datas) {
                        if (dataItem.size > 0) {
                            let resItem = {
                                resid: dataItem.resid,
                                fileName: dataItem.name,
                                fileSize: parseInt(dataItem.size),
                                shareUserId: dataItem.puid,
                                path: dataItem.ppath + "/" + dataItem.name,
                                objectId: dataItem.objectId,
                            };
                            dataList.push(resItem);
                        }
                    }
                    if (page >= pageCount) {
                        resolve({ success: true, hasMore: false });
                    }
                    else {
                        resolve({ success: true, hasMore: true });
                    }
                }
                else {
                    resolve({ success: false, hasMore: false });
                }
            });
        });
        request.end();
    });
}
exports.getGroupFileInFolderOnPage = getGroupFileInFolderOnPage;
async function uploadFileToCloudDisk(uploadId, fileInfo, uploadtype = "normal", fldid, progressCallback) {
    if (!fileInfo || (!fileInfo.filePath && !fileInfo.fileData)) {
        return { success: false };
    }
    return loadToken().then((token) => {
        if (!token) {
            return { success: false };
        }
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return { success: false };
        }
        if (fileInfo.fileData) {
            return uploadFileToCloudDiskSingle(uploadId, token, puid, fileInfo, uploadtype, fldid, progressCallback);
        }
        if (!fs_1.default.existsSync(fileInfo.filePath)) {
            return { success: false };
        }
        let stat = fs_1.default.statSync(fileInfo.filePath);
        if (stat.size < 50 * 1024 * 1024) {
            return uploadFileToCloudDiskSingle(uploadId, token, puid, fileInfo, uploadtype, fldid, progressCallback);
        }
        else {
            return uploadFileToCloudDiskSplit(uploadId, token, puid, fileInfo, uploadtype, fldid, progressCallback);
        }
    });
}
exports.uploadFileToCloudDisk = uploadFileToCloudDisk;
async function uploadFileToCloudDiskSingle(uploadId, token, puid, fileInfo, uploadtype, fldid, progressCallback) {
    let fileName = fileInfo.fileName;
    if (!fileName) {
        if (fileInfo.filePath) {
            fileName = path_1.default.basename(fileInfo.filePath);
        }
        else {
            fileName = new Date().getTime() + "";
        }
    }
    let usp = new url_1.URLSearchParams();
    usp.append("_token", token);
    usp.append("puid", puid);
    if (uploadtype) {
        usp.append("uploadtype", uploadtype);
    }
    if (fldid) {
        usp.append("fldid", fldid);
    }
    usp.append("hideFile", "true");
    let url = new url_1.URL(UPLOAD_FILE_URL);
    url.search = usp.toString();
    const urlStr = url.toString();
    console.log("start uploadFile:", urlStr);
    let fileStream;
    if (fileInfo.filePath) {
        fileStream = fs_1.default.createReadStream(fileInfo.filePath, {
            highWaterMark: 5 * 1024 * 1024,
        });
    }
    else {
    }
    return new Promise((resolve, reject) => {
        let request = electron_1.net.request({
            url: urlStr,
            method: "POST",
            useSessionCookies: true,
        });
        let uploadFileInfo = UploadFileInfoMap.getUploadFileInfo(uploadId);
        if (uploadFileInfo) {
            if (uploadFileInfo.canceled) {
                request.abort();
                resolve({ success: false });
                return;
            }
            uploadFileInfo.fileStream = fileStream;
            uploadFileInfo.request = request;
        }
        const boundaryKey = "--" + Math.random().toString(16);
        request.setHeader("Content-Type", "multipart/form-data; boundary=" + boundaryKey);
        request.setHeader("Connection", "keep-alive");
        request.write(`--${boundaryKey}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\n\r\n`);
        let intervalId;
        let startuploadTime = new Date().getTime();
        const sendUploadProgress = () => {
            let uploadProgress = request.getUploadProgress();
            console.log("uploadProgress1:", uploadProgress);
            if (uploadProgress) {
                progressCallback(uploadProgress.current, uploadProgress.total);
                if (uploadProgress.total > 0 &&
                    uploadProgress.current >= uploadProgress.total) {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = undefined;
                    }
                }
            }
            else {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = undefined;
                }
            }
        };
        request.on("response", (response) => {
            let responseBuf;
            response.on("data", (chunk) => {
                if (responseBuf) {
                    responseBuf = Buffer.concat([responseBuf, chunk]);
                }
                else {
                    responseBuf = chunk;
                }
            });
            response.on("end", () => {
                console.log(`BODY: ${responseBuf}`);
                let resData = JSON.parse(responseBuf.toString());
                try {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = undefined;
                    }
                    sendUploadProgress();
                    resolve(resData);
                }
                catch (e) {
                    console.warn(e);
                }
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = undefined;
                }
            });
        });
        request.on("abort", () => {
            console.debug("request abort:", uploadId, new Date().getTime() - startuploadTime);
            resolve({ success: false });
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
        });
        request.on("error", () => {
            resolve({ success: false });
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
        });
        if (fileStream) {
            let writeDataSize = 0;
            fileStream.on("data", (chunk) => {
                writeDataSize += chunk.length;
                console.log("write data:", writeDataSize);
                request.write(chunk);
            });
            fileStream.on("end", () => {
                request.end("\r\n--" + boundaryKey + "--\r\n");
            });
            fileStream.on("error", (error) => {
                console.log("fileStream,error", error);
                resolve({ success: false });
                request.abort();
            });
        }
        else if (fileInfo.fileData) {
            request.write(fileInfo.fileData);
            request.end("\r\n--" + boundaryKey + "--\r\n");
        }
        if (progressCallback) {
            intervalId = setInterval(() => {
                sendUploadProgress();
            }, 300);
        }
    });
}
exports.uploadFileToCloudDiskSingle = uploadFileToCloudDiskSingle;
async function uploadFileToCloudDiskSplit(uploadId, token, puid, fileInfo, uploadtype, fldid, progressCallback) {
    let fileName = fileInfo.fileName;
    if (!fileName) {
        if (fileInfo.filePath) {
            fileName = path_1.default.basename(fileInfo.filePath);
        }
        else {
            fileName = new Date().getTime() + "";
        }
    }
    const stat = fs_1.default.statSync(fileInfo.filePath);
    const fileSize = stat.size;
    let crcRet = await getFileCrc(token, puid, fileInfo.filePath, fileName);
    if (!crcRet || crcRet.code !== 2 || !crcRet.data?.crc) {
        return { success: false };
    }
    let splitData = await getUploadSplitInitData(token, puid, fileInfo.filePath, fileName, crcRet.data.crc, fldid);
    if (!splitData || splitData.code !== 2) {
        return { success: false, newCode: splitData?.newCode };
    }
    let chunkList = splitData.data.fileChunkList;
    if (!chunkList || chunkList.length == 0) {
        return { success: false };
    }
    const progressData = { curPro: 0, tempPro: 0, tempTotal: 0 };
    let uploadChunkRet;
    for (let chunckInfo of chunkList) {
        uploadChunkRet = await uploadFileChunk(uploadId, token, puid, fileInfo.filePath, fileName, chunckInfo, (alreadySendSize, totalSize) => {
            progressData.tempPro = alreadySendSize;
            progressData.tempTotal = totalSize;
            progressCallback(progressData.curPro + alreadySendSize, fileSize);
        });
        if (!uploadChunkRet || !uploadChunkRet.result) {
            return { success: false };
        }
        progressData.curPro += progressData.tempTotal;
    }
    if (!uploadChunkRet.chunkUploadCompleted) {
        return { success: false };
    }
    splitData.data.fileChunkList = undefined;
    splitData.data.residstr = uploadChunkRet.residStr;
    splitData.data.resid = uploadChunkRet.resid;
    splitData.data.isfile = uploadChunkRet.fileInfo.isfile;
    splitData.data.objectId = uploadChunkRet.fileInfo.objectId;
    splitData.data.suffix = uploadChunkRet.fileInfo.suffix;
    splitData.data.size = splitData.data.fileSize;
    return { success: true, data: splitData.data, result: true };
}
exports.uploadFileToCloudDiskSplit = uploadFileToCloudDiskSplit;
async function getFileCrc(token, puid, filePath, fileName) {
    let usp = new url_1.URLSearchParams();
    usp.append("_token", token);
    usp.append("puid", puid);
    let stat = fs_1.default.statSync(filePath);
    usp.append("size", stat.size + "");
    let url = new url_1.URL(UPLOAD_FILE_CRC);
    url.search = usp.toString();
    const urlStr = url.toString();
    console.log("start getFileCrc:", urlStr);
    const bufferSize = 512 * 1024;
    const file0Data = Buffer.alloc(bufferSize);
    const file1Data = Buffer.alloc(bufferSize);
    let fd = fs_1.default.openSync(filePath, "r");
    fs_1.default.readSync(fd, file0Data, 0, bufferSize, 0);
    fs_1.default.readSync(fd, file1Data, 0, bufferSize, stat.size - bufferSize);
    return new Promise((resolve, reject) => {
        let request = electron_1.net.request({
            url: urlStr,
            method: "POST",
            useSessionCookies: true,
        });
        const boundaryKey = "--" + Math.random().toString(16);
        request.setHeader("Content-Type", "multipart/form-data; boundary=" + boundaryKey);
        request.setHeader("Connection", "keep-alive");
        request.write(`--${boundaryKey}\r\nContent-Disposition: form-data; name="file0"; filename="${fileName}"\r\n\r\n`);
        request.write(file0Data);
        request.write("\r\n");
        request.write(`--${boundaryKey}\r\nContent-Disposition: form-data; name="file1"; filename="${fileName}"\r\n\r\n`);
        request.write(file1Data);
        request.end("\r\n--" + boundaryKey + "--\r\n");
        request.on("response", (response) => {
            response.on("data", (result) => {
                console.log(`BODY: ${result}`);
                try {
                    result = JSON.parse(result);
                    resolve(result);
                }
                catch (e) {
                    console.warn(e);
                }
            });
            response.on("end", () => {
                console.log("响应中已无数据");
            });
            response.on("error", () => {
                resolve({ success: false });
            });
        });
        request.on("error", () => {
            resolve({ success: false });
        });
    });
}
async function getUploadSplitInitData(token, puid, filePath, fileName, crc, fldid) {
    let usp = new url_1.URLSearchParams();
    usp.append("_token", token);
    usp.append("puid", puid);
    usp.append("fn", fileName);
    let stat = fs_1.default.statSync(filePath);
    usp.append("fs", stat.size + "");
    usp.append("crc", crc);
    usp.append("hideFile", "1");
    usp.append("panType", "2");
    if (fldid) {
        usp.append("fldid", fldid);
    }
    let url = new url_1.URL(UPLOAD_FILE_INIT_TASK);
    url.search = usp.toString();
    const urlStr = url.toString();
    console.log("start getFileCrc:", urlStr);
    return new Promise((resolve, reject) => {
        let request = electron_1.net.request({
            url: urlStr,
            useSessionCookies: true,
        });
        request.end();
        request.on("response", (response) => {
            let responseBuf;
            response.on("data", (chunk) => {
                if (responseBuf) {
                    responseBuf = Buffer.concat([responseBuf, chunk]);
                }
                else {
                    responseBuf = chunk;
                }
            });
            response.on("end", () => {
                console.log("响应中已无数据");
                console.debug(`BODY: ${responseBuf}`);
                let resData = JSON.parse(responseBuf.toString());
                resolve(resData);
            });
            response.on("error", () => {
                resolve({ success: false });
            });
        });
        request.on("error", () => {
            resolve({ success: false });
        });
    });
}
electron_1.ipcMain.on("_uploadFileToCloudDisk", (event, fileInfo, uploadId, fldid) => {
    UploadFileInfoMap.addUploadFileInfoById(uploadId);
    const senderWebContents = event.sender;
    uploadFileToCloudDisk(uploadId, fileInfo, fileInfo.uploadtype, fldid, (alreadySendSize, totalSize) => {
        if (!senderWebContents.isDestroyed() &&
            !senderWebContents.isCrashed()) {
            senderWebContents.send(`_uploadFileToCloudDisk_progress_${uploadId}`, {
                alreadySendSize,
                totalSize,
            });
        }
        else {
            UploadFileInfoMap.getUploadFileInfo;
        }
    })
        .then((data) => {
        UploadFileInfoMap.removeUploadFileInfo(uploadId);
        console.debug("uploadFileToCloudDisk data:", data);
        if (!senderWebContents.isDestroyed() &&
            !senderWebContents.isCrashed()) {
            senderWebContents.send(`_uploadFileToCloudDisk_progress_${uploadId}`, {
                state: "done",
                data,
            });
        }
    })
        .catch((e) => {
        console.error(`[_uploadFileToCloudDisk] error:`, e);
        UploadFileInfoMap.removeUploadFileInfo(uploadId);
    });
});
async function uploadFileChunk(uploadId, token, puid, filePath, fileName, chunkInfo, progressCallback) {
    let usp = new url_1.URLSearchParams();
    usp.append("_token", token);
    usp.append("puid", puid);
    let url = new url_1.URL(`${CLOUD_PAN_DOMAIN}${chunkInfo.fileChunkUploadUrl}`);
    url.search = usp.toString();
    const urlStr = url.toString();
    console.log("start uploadFile:", urlStr);
    let fileStream = fs_1.default.createReadStream(filePath, {
        start: chunkInfo.startByte,
        end: chunkInfo.endByte - 1,
        highWaterMark: 5 * 1024 * 1024,
    });
    return new Promise((resolve, reject) => {
        let request = electron_1.net.request({
            url: urlStr,
            method: "POST",
            useSessionCookies: true,
        });
        let uploadFileInfo = UploadFileInfoMap.getUploadFileInfo(uploadId);
        if (uploadFileInfo) {
            if (uploadFileInfo.canceled) {
                request.abort();
                resolve({ success: false });
                return;
            }
            uploadFileInfo.fileStream = fileStream;
            uploadFileInfo.request = request;
        }
        const boundaryKey = "--" + Math.random().toString(16);
        request.setHeader("Content-Type", "multipart/form-data; boundary=" + boundaryKey);
        request.setHeader("Connection", "keep-alive");
        request.write(`--${boundaryKey}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\n\r\n`);
        let intervalId;
        const sendUploadProgress = () => {
            let uploadProgress = request.getUploadProgress();
            console.log("uploadProgress1:", uploadProgress);
            if (uploadProgress) {
                progressCallback(uploadProgress.current, uploadProgress.total);
                if (uploadProgress.total > 0 &&
                    uploadProgress.current >= uploadProgress.total) {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = undefined;
                    }
                }
            }
            else {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = undefined;
                }
            }
        };
        request.on("response", (response) => {
            let responseBuf;
            response.on("data", (chunk) => {
                if (responseBuf) {
                    responseBuf = Buffer.concat([responseBuf, chunk]);
                }
                else {
                    responseBuf = chunk;
                }
            });
            response.on("end", () => {
                console.log("响应中已无数据");
                console.debug(`BODY: ${responseBuf}`);
                try {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = undefined;
                    }
                    let resData = JSON.parse(responseBuf.toString());
                    sendUploadProgress();
                    resolve(resData);
                }
                catch (e) {
                    console.warn(e);
                }
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = undefined;
                }
            });
        });
        request.on("abort", () => {
            resolve({ success: false });
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
        });
        request.on("error", () => {
            resolve({ success: false });
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = undefined;
            }
        });
        let writeDataSize = 0;
        fileStream.on("data", (chunk) => {
            writeDataSize += chunk.length;
            console.log("write data:", writeDataSize);
            request.write(chunk);
        });
        fileStream.on("end", () => {
            request.end("\r\n--" + boundaryKey + "--\r\n");
        });
        fileStream.on("error", () => {
            resolve({ success: false });
            request.abort();
        });
        if (progressCallback) {
            intervalId = setInterval(() => {
                sendUploadProgress();
            }, 300);
        }
    });
}
exports.uploadFileChunk = uploadFileChunk;
class FileInfo {
}
class FolderInfo {
    constructor(folderPath) {
        this.fileSize = 0;
        this.fileList = [];
        this.subFolderList = [];
        if (folderPath) {
            this.filePath = folderPath;
            this.fileName = path_1.default.basename(folderPath);
            const subFiles = fs_1.default.readdirSync(folderPath);
            for (let subFile of subFiles) {
                const subFilePath = path_1.default.join(folderPath, subFile);
                const stat = fs_1.default.statSync(subFilePath);
                if (stat.isFile()) {
                    if (subFile == ".DS_Store" && process.platform == "darwin") {
                        continue;
                    }
                    const subFileInfo = new FileInfo();
                    subFileInfo.filePath = subFilePath;
                    subFileInfo.fileName = subFile;
                    subFileInfo.fileSize = stat.size;
                    this.fileSize += subFileInfo.fileSize;
                    this.fileList.push(subFileInfo);
                }
                else if (stat.isDirectory()) {
                    const subFolderInfo = new FolderInfo(subFilePath);
                    if (subFolderInfo.fileSize > 0) {
                        this.fileSize += subFolderInfo.fileSize;
                        this.subFolderList.push(subFolderInfo);
                    }
                }
            }
        }
    }
}
async function uploadFolderToCloudDisk(uploadId, folderPath, progressCallback) {
    if (!fs_1.default.existsSync(folderPath)) {
        return { success: false };
    }
    const token = await loadToken();
    if (!token) {
        return { success: false };
    }
    let puid = (0, UserHelper_1.getUID)();
    if (!puid) {
        return { success: false };
    }
    const folderInfo = new FolderInfo(folderPath);
    const folderData = await createHideCloundDiskFolderByFolderInfo(token, puid, folderInfo, undefined);
    if (!folderData || !folderData.success) {
        return folderData;
    }
    let data = await uploadSubFolderToCloudDisk(uploadId, token, puid, folderInfo, (alreadySendSize) => {
        progressCallback(alreadySendSize, folderInfo.fileSize);
    });
    if (data.success && folderInfo.resid) {
        let shareData = await createShareFolder(token, puid, folderInfo.encryptedId ?? folderInfo.resid);
        if (shareData && shareData.success && shareData.data) {
            folderData.data.shareid = shareData.data.shareid;
            folderData.data.weburl = shareData.data.weburl;
        }
        return folderData;
    }
}
exports.uploadFolderToCloudDisk = uploadFolderToCloudDisk;
async function uploadSubFolderToCloudDisk(uploadId, token, puid, folderInfo, progressCallback) {
    const files = folderInfo.fileList;
    const progressData = { curPro: 0, tempTotal: 0 };
    for (let file of files) {
        let ret = await uploadFileToCloudDisk(uploadId, { filePath: file.filePath, fileName: file.fileName }, undefined, folderInfo.resid, (alreadySendSize, totalSize) => {
            if (alreadySendSize > file.fileSize) {
                alreadySendSize = file.fileSize;
            }
            progressCallback(progressData.curPro + alreadySendSize);
        });
        if (!ret || ret.success === false) {
            return { success: false, errCode: ret?.errCode };
        }
        progressData.curPro += file.fileSize;
    }
    for (let subFolder of folderInfo.subFolderList) {
        const ret = await uploadSubFolderToCloudDisk(uploadId, token, puid, subFolder, (alreadySendSize) => {
            progressData.tempTotal = alreadySendSize;
            progressCallback(progressData.curPro + alreadySendSize);
        });
        if (!ret || ret.success === false) {
            return { success: false, errCode: ret?.errCode };
        }
        progressData.curPro += subFolder.fileSize;
    }
    return { success: true };
}
exports.uploadSubFolderToCloudDisk = uploadSubFolderToCloudDisk;
async function createHideCloundDiskFolderByFolderInfo(token, puid, folderInfo, pntid) {
    let baseName = folderInfo.fileName;
    const ret = await createHideCloundDiskFolder(token, puid, baseName, pntid);
    if (!ret || !ret.success) {
        return ret;
    }
    const dirData = ret.data;
    let resid = dirData.residstr;
    folderInfo.resid = resid;
    folderInfo.encryptedId = dirData.encryptedId;
    for (const subFolderInfo of folderInfo.subFolderList) {
        const ret2 = await createHideCloundDiskFolderByFolderInfo(token, puid, subFolderInfo, resid);
        if (!ret2 || !ret2.success) {
            return ret2;
        }
    }
    return ret;
}
exports.createHideCloundDiskFolderByFolderInfo = createHideCloundDiskFolderByFolderInfo;
async function createHideCloundDiskFolder(token, puid, folderName, pntid) {
    let usp = new url_1.URLSearchParams();
    usp.append("_token", token);
    usp.append("puid", puid);
    if (pntid) {
        usp.append("pntid", pntid);
    }
    usp.append("hideDir", "true");
    let url = new url_1.URL(`${CREATE_CLOUD_FOLDER_URL}`);
    url.search = usp.toString();
    const urlStr = url.toString();
    console.log("createHideCloundDiskFolder:url:", urlStr);
    return new Promise((resolve, reject) => {
        const req = electron_1.net.request({
            url: urlStr,
            method: "POST",
            useSessionCookies: true,
        });
        const postData = `name=${folderName}`;
        req.setHeader("Content-Type", "application/x-www-form-urlencoded");
        req.on("response", (response) => {
            let responseBuf;
            response.on("data", (chunk) => {
                if (responseBuf) {
                    responseBuf = Buffer.concat([responseBuf, chunk]);
                }
                else {
                    responseBuf = chunk;
                }
            });
            response.on("end", () => {
                console.log("响应中已无数据");
                console.debug(`BODY: ${responseBuf}`);
                try {
                    let resData = JSON.parse(responseBuf.toString());
                    if (!resData || !resData.result || resData.code != 2) {
                        resolve({ success: false, errCode: resData.newCode });
                    }
                    resolve({ success: true, data: resData.data });
                }
                catch (e) {
                    resolve({ success: false });
                }
            });
            response.on("error", () => {
                resolve({ success: false });
            });
        });
        req.on("error", (error) => {
            console.warn(error);
            return { success: false };
        });
        req.write(postData);
        req.end();
    });
}
exports.createHideCloundDiskFolder = createHideCloundDiskFolder;
electron_1.ipcMain.handle("_uploadFolderToCloudDisk", async (event, filePath, uploadId) => {
    UploadFileInfoMap.addUploadFileInfoById(uploadId);
    const senderWebContents = event.sender;
    try {
        let data = await uploadFolderToCloudDisk(uploadId, filePath, (alreadySendSize, totalSize) => {
            if (!senderWebContents.isDestroyed() &&
                !senderWebContents.isCrashed()) {
                senderWebContents.send(`_uploadFolderToCloudDiskProgress_${uploadId}`, {
                    alreadySendSize,
                    totalSize,
                });
            }
            else {
                UploadFileInfoMap.removeUploadFileInfo(uploadId);
            }
        });
        if (data) {
            UploadFileInfoMap.removeUploadFileInfo(uploadId);
            if (!senderWebContents.isDestroyed() &&
                !senderWebContents.isCrashed()) {
                senderWebContents.send(`_uploadFolderToCloudDisk_progress_${uploadId}`, {
                    state: "done",
                    data,
                });
            }
            return data;
        }
    }
    catch (e) {
        UploadFileInfoMap.removeUploadFileInfo(uploadId);
    }
});
async function createShareFolder(token, puid, resEncId) {
    let usp = new url_1.URLSearchParams();
    usp.append("puid", puid);
    usp.append("_token", token);
    usp.append("resids", resEncId);
    usp.append("type", "SHARE_APP");
    usp.append("vt", "VT_FOREVER");
    usp.append("pantype", "USER_PAN");
    let url = new url_1.URL(CREATE_CLOUD_SHARE_URL);
    url.search = usp.toString();
    console.log("createShareFolder url:", url.toString());
    return new Promise((resolve, reject) => {
        const request = electron_1.net.request({
            url: url.toString(),
            useSessionCookies: true,
        });
        let responseBuf;
        request.on("response", (response) => {
            console.log(`loadToken STATUS: ${response.statusCode}`);
            if (response.statusCode != 200) {
                resolve(undefined);
                return;
            }
            response.on("data", (chunk) => {
                if (responseBuf) {
                    responseBuf = Buffer.concat([responseBuf, chunk]);
                }
                else {
                    responseBuf = chunk;
                }
            });
            response.on("end", () => {
                console.debug("No more data in response.");
                console.debug(`BODY: ${responseBuf}`);
                let resData = JSON.parse(responseBuf.toString());
                console.debug("createShareFolder,response:", resData);
                if (resData.code == 2 && resData.data) {
                    resolve({ success: true, data: resData.data });
                }
                else {
                    resolve({ success: false });
                }
            });
        });
        request.on("error", (error) => {
            console.warn(error);
            return { success: false };
        });
        request.end();
    });
}
function getVideoPlayUrl(fleid, objectid) {
    return loadToken().then((token) => {
        if (!token) {
            return undefined;
        }
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return undefined;
        }
        let usp = new url_1.URLSearchParams();
        usp.append("puid", puid);
        usp.append("fleid", fleid);
        usp.append("objectid", objectid);
        usp.append("_token", token);
        let url = new url_1.URL(CLOUD_GET_VIDEO_PLAY_URL);
        url.search = usp.toString();
        console.log("get videoPlay url:", url.toString());
        return new Promise((resolve, reject) => {
            const request = electron_1.net.request({
                url: url.toString(),
                useSessionCookies: true,
            });
            let responseBuf;
            request.on("response", (response) => {
                console.log(`loadToken STATUS: ${response.statusCode}`);
                if (response.statusCode != 200) {
                    resolve(undefined);
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    console.debug("No more data in response.");
                    console.debug(`BODY: ${responseBuf}`);
                    let resData = JSON.parse(responseBuf.toString());
                    console.debug("getVideoPlayUrl,response:", resData);
                    resolve(resData);
                });
            });
            request.end();
        });
    });
}
function getExtFilesInfo(resids, objectId) {
    return loadToken().then((token) => {
        if (!token) {
            return undefined;
        }
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return undefined;
        }
        let usp = new url_1.URLSearchParams();
        usp.append("puid", puid);
        if (objectId) {
            usp.append("objectId", objectId);
        }
        if (resids) {
            usp.append("resids", resids);
        }
        usp.append("_token", token);
        let url = new url_1.URL(CLOUD_GET_EXT_FILE_INFO);
        url.search = usp.toString();
        console.log("get extfileinfo url:", url.toString());
        return new Promise((resolve, reject) => {
            const request = electron_1.net.request({
                url: url.toString(),
                useSessionCookies: true,
            });
            let responseBuf;
            request.on("response", (response) => {
                console.log(`loadToken STATUS: ${response.statusCode}`);
                if (response.statusCode != 200) {
                    resolve(undefined);
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    console.debug("No more data in response.");
                    console.debug(`BODY: ${responseBuf}`);
                    let resData = JSON.parse(responseBuf.toString());
                    console.debug("getExtFilesInfo,response:", resData);
                    if (resData.result && resData.data) {
                        resolve(resData);
                    }
                });
            });
            request.end();
        });
    });
}
electron_1.ipcMain.handle("_getCloudVideoUrl", async (event, filed, objectid) => {
    let res = await getVideoPlayUrl(filed, objectid);
    return res;
});
electron_1.ipcMain.handle("_getCloudDownloadUrl", async (event, data) => {
    let res = await getDownloadUrl(data.fleid, data.sharepuid, data.objectId);
    return res;
});
electron_1.ipcMain.handle("_getCloudExtFilesInfo", async (event, data) => {
    let res = await getExtFilesInfo(data.resids, data.objectId);
    return res;
});
function getSupportPreviewSuffix() {
    return loadToken().then((token) => {
        if (!token) {
            return undefined;
        }
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return undefined;
        }
        let usp = new url_1.URLSearchParams();
        usp.append("puid", puid);
        usp.append("_token", token);
        let url = new url_1.URL(CLOUD_GET_SUPPORT_PREVIEW_SUFFIX);
        url.search = usp.toString();
        console.log("get supportPreviewSuffix url:", url.toString());
        return new Promise((resolve, reject) => {
            const request = electron_1.net.request({
                url: url.toString(),
                useSessionCookies: true,
            });
            let responseBuf;
            request.on("response", (response) => {
                console.log(`loadToken STATUS: ${response.statusCode}`);
                if (response.statusCode != 200) {
                    resolve(undefined);
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    console.debug("No more data in response.");
                    console.debug(`BODY: ${responseBuf}`);
                    let resData = JSON.parse(responseBuf.toString());
                    console.debug("getExtFilesInfo,response:", resData);
                    if (resData.result && resData.data) {
                        resolve(resData);
                    }
                });
            });
            request.end();
        });
    });
}
function getAtttPreviewRes(resid, sharepuid, objectId) {
    return loadToken().then((token) => {
        if (!token) {
            return undefined;
        }
        let puid = (0, UserHelper_1.getUID)();
        if (!puid) {
            return undefined;
        }
        let usp = new url_1.URLSearchParams();
        usp.append("puid", puid);
        let url = new url_1.URL(CLOUD_GET_DOWNLOAD_URL);
        if (resid) {
            usp.append("fleid", resid);
            url = new url_1.URL(CLOUD_GET_DOWNLOAD_URL);
        }
        else {
            usp.append("objectid", objectId);
            url = new url_1.URL(CLOUD_GET_DOWNLOADuRL_BY_OBJECTID);
        }
        if (sharepuid != puid) {
            url = new url_1.URL(CLOUD_GET_DOWNLOAD_SHARE_URL);
            usp.append("sarepuid", sharepuid);
        }
        usp.append("_token", token);
        url.search = usp.toString();
        console.log("getAtttPreviewRes:", url.toString());
        return new Promise((resolve, reject) => {
            const request = electron_1.net.request({
                url: url.toString(),
                useSessionCookies: true,
            });
            let responseBuf;
            request.on("response", (response) => {
                console.log(`loadToken STATUS: ${response.statusCode}`);
                if (response.statusCode != 200) {
                    resolve(undefined);
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    console.debug("No more data in response.");
                    console.debug(`BODY: ${responseBuf}`);
                    try {
                        let resData = JSON.parse(responseBuf.toString());
                        console.debug("getAtttPreviewRes,response:", resData);
                        if (!resData || !resData.result) {
                            resolve({ success: false, errCode: resData.newCode });
                        }
                        resolve({ success: true, data: resData });
                    }
                    catch (e) {
                        resolve({ success: false });
                    }
                });
            });
            request.end();
        });
    });
}
function getAttBelonger(objectId) {
    return loadToken().then((token) => {
        if (!token) {
            return undefined;
        }
        let usp = new url_1.URLSearchParams();
        usp.append("objectid", objectId);
        usp.append("_token", token);
        let url = new url_1.URL(CLOUD_GET_ATT_BELONGER);
        url.search = usp.toString();
        console.log("get getAttBelonger url:", url.toString());
        return new Promise((resolve, reject) => {
            const request = electron_1.net.request({
                url: url.toString(),
                useSessionCookies: true,
            });
            let responseBuf;
            request.on("response", (response) => {
                console.log(`loadToken STATUS: ${response.statusCode}`);
                if (response.statusCode != 200) {
                    resolve(undefined);
                    return;
                }
                response.on("data", (chunk) => {
                    if (responseBuf) {
                        responseBuf = Buffer.concat([responseBuf, chunk]);
                    }
                    else {
                        responseBuf = chunk;
                    }
                });
                response.on("end", () => {
                    console.debug("No more data in response.");
                    console.debug(`BODY: ${responseBuf}`);
                    try {
                        let resData = JSON.parse(responseBuf.toString());
                        console.debug("getAttBelonger,response:", resData);
                        if (!resData || !resData.result) {
                            resolve({ success: false, errCode: resData.newCode });
                        }
                        resolve({ success: true, data: resData });
                    }
                    catch (e) {
                        resolve({ success: false });
                    }
                });
            });
            request.end();
        });
    });
}
electron_1.ipcMain.handle("_getAtttPreviewRes", async (event, data) => {
    let res = await getAtttPreviewRes(data.resid, data.sharepuid, data.objectId);
    return res;
});
electron_1.ipcMain.handle("_getSupportPreviewSuffix", async (event, data) => {
    let res = await getSupportPreviewSuffix();
    return res;
});
electron_1.ipcMain.on("_cancelUploadCloudDisk", (event, uploadId) => {
    UploadFileInfoMap.getUploadFileInfo(uploadId)?.cancelUpload();
});
electron_1.ipcMain.handle("_getAttBelonger", async (event, data) => {
    let res = await getAttBelonger(data.objectId);
    return res;
});
const PAN_YZ_APP_ID = "CD7DD36F-96B6-47F5-A7A4-4F3449FADD16";
const PAN_YZ_APP_KEY = "B9CC827AA11248DCA35327127EC4D2FE";
async function netRequestGetPanYz(url) {
    let encryptedUrl = getEncRequestUrlPanYz(url);
    let result = await (0, NetUtil_1.netRequestGet)(encryptedUrl);
    if (result.ok) {
        return result.json();
    }
}
electron_1.ipcMain.handle("_netRequestGetPanYz", (event, url) => {
    return netRequestGetPanYz(url);
});
function getEncRequestUrlPanYz(url) {
    let _url = new url_1.URL(url);
    let searchQuery = _url.searchParams;
    const nonce = Math.random().toString(36).substring(2, 15);
    let newParms = [];
    newParms.push(`appid=${PAN_YZ_APP_ID}`);
    newParms.push(`nonce=${nonce}`);
    newParms.push(`timestamp=${Date.now()}`);
    let parmArray = [];
    searchQuery.forEach((value, key) => {
        parmArray.push(`${key}=${encodeURI(value)}`);
    });
    parmArray.splice(0, 0, ...newParms);
    parmArray.sort();
    let parmsStr = parmArray.join("#");
    parmsStr = parmsStr.replaceAll("=", "#");
    parmsStr += `#${PAN_YZ_APP_KEY}`;
    let signature = (0, CryptoUtil_1.md5)(parmsStr);
    if (url.includes("?")) {
        url += "&";
    }
    else {
        url += "?";
    }
    url += `${newParms.join("&")}&signature=${signature}`;
    return url;
}
module.exports = {
    getFileInFolder,
    getDownloadUrl,
    getGroupFileInFolder,
    uploadFileToCloudDisk,
    uploadFolderToCloudDisk,
    getVideoPlayUrl,
};
//# sourceMappingURL=CloudDiskHelper.js.map
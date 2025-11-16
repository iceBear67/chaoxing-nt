"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onEnableVideoFrameCache = exports.getVideoFrameDataInfoByUid = exports.convertVideoFrameData = void 0;
const electron_1 = require("electron");
class DataTransferInfo {
    constructor() {
        this.videoType = 0;
    }
}
let m_getVideoFrameFun;
let m_enableVideoFrameCacheFun;
let m_DataTransferInfos = new Array();
let m_CheckSendVideoTimer;
let m_SdkType = 0;
function getContentsIds(uid) {
    let contentsIds = [];
    for (let i = 0; i < m_DataTransferInfos.length; i++) {
        if (m_DataTransferInfos[i].uid == uid) {
            contentsIds.push(m_DataTransferInfos[i].contentsId);
        }
    }
    return contentsIds;
}
function addContentsId(uid, contentsId, videoType) {
    for (let i = 0; i < m_DataTransferInfos.length; i++) {
        let data = m_DataTransferInfos[i];
        if (data.uid == uid &&
            data.videoType == videoType &&
            data.contentsId == contentsId) {
            return;
        }
    }
    let data = new DataTransferInfo();
    data.uid = uid;
    data.videoType = videoType;
    data.contentsId = contentsId;
    data.renderItem = resizeShareVideoFrame(videoType, undefined, uid);
    if (m_enableVideoFrameCacheFun) {
        let cacheConfig = m_enableVideoFrameCacheFun({
            uid: data.renderItem.uid,
            videoSourceType: data.renderItem.videoSourceType,
            channelId: data.renderItem.channelId,
        });
        if (!data.renderItem.channelId && cacheConfig?.channelId) {
            data.renderItem.channelId = cacheConfig.channelId;
        }
    }
    m_DataTransferInfos.push(data);
}
function removeAll() {
    m_DataTransferInfos = new Array();
}
function removeContentsId(uid, contentsId) {
    if (!uid && !contentsId) {
        removeAll();
        return;
    }
    for (let i = m_DataTransferInfos.length - 1; i >= 0; i--) {
        let data = m_DataTransferInfos[i];
        if (uid) {
            if (data.uid == uid) {
                if (contentsId) {
                    if (data.contentsId == contentsId) {
                        m_DataTransferInfos.splice(i, 1);
                    }
                }
                else {
                    m_DataTransferInfos.splice(i, 1);
                }
                return;
            }
        }
        else {
            if (data.contentsId == contentsId) {
                m_DataTransferInfos.splice(i, 1);
            }
        }
    }
}
function sendVideoRowDatas(infos) {
    if (m_DataTransferInfos.length == 0) {
        return;
    }
    for (let i = 0; i < infos.length; i++) {
        let info = infos[i];
        let toContentsIds = getContentsIds(info.uid);
        if (toContentsIds && toContentsIds.length > 0) {
            if (!info.width && info.header) {
                var dv = new DataView(info.header);
                info.format = dv.getUint8(0);
                info.mirror = dv.getUint8(1);
                info.width = dv.getUint16(2);
                info.height = dv.getUint16(4);
                info.left = dv.getUint16(6);
                info.top = dv.getUint16(8);
                info.right = dv.getUint16(10);
                info.bottom = dv.getUint16(12);
                info.rotation = dv.getUint16(14);
                info.ts = dv.getUint32(16);
            }
            electron_1.ipcRenderer
                .invoke("_sendVideoRowDatas", info, toContentsIds)
                .then((errIds) => {
                if (errIds && errIds.length > 0) {
                    errIds.forEach((errId) => {
                        removeContentsId(null, errId);
                    });
                }
            });
        }
    }
}
function checkSendVideoRow() {
    if (m_DataTransferInfos.length == 0 || !m_getVideoFrameFun) {
        return;
    }
    for (let dataTransferInfo of m_DataTransferInfos) {
        let videoDataInfo = getVideoFrameDataInfo(dataTransferInfo);
        if (videoDataInfo) {
            electron_1.ipcRenderer
                .invoke("_sendVideoRowDatas", videoDataInfo, [
                dataTransferInfo.contentsId,
            ])
                .then((errIds) => {
                if (errIds && errIds.length > 0) {
                    errIds.forEach((errId) => {
                        removeContentsId(null, errId);
                    });
                }
            });
        }
    }
}
function convertVideoFrameData(videoFrame, localMirrorMode) {
    let info = {};
    let header_buffer = new ArrayBuffer(20);
    let header = new DataView(header_buffer);
    header.setUint8(0, 0);
    header.setUint8(1, 0);
    header.setUint16(2, videoFrame.width);
    header.setUint16(4, videoFrame.height);
    header.setUint16(6, 0);
    header.setUint16(8, 0);
    header.setUint16(10, 0);
    header.setUint16(12, 0);
    header.setUint16(14, 0);
    header.setUint32(16, 0);
    info.type = 0;
    info.vType = 0;
    info.ydata = videoFrame.yBuffer;
    info.udata = videoFrame.uBuffer;
    info.vdata = videoFrame.vBuffer;
    info.uid = videoFrame.uid;
    info.header = header_buffer;
    info.format = 0;
    info.mirror = 0;
    info.width = videoFrame.width;
    info.height = videoFrame.height;
    info.left = 0;
    info.top = 0;
    info.right = 0;
    info.bottom = 0;
    info.rotation = 0;
    info.ts = 0;
    info.yStride = videoFrame.yStride;
    if (localMirrorMode) {
        info.localMirrorMode = true;
    }
    return info;
}
exports.convertVideoFrameData = convertVideoFrameData;
function getVideoFrameDataInfoByUid(uid, videoSourceType) {
    let curDataTransferInfo;
    for (let dataTransferInfo of m_DataTransferInfos) {
        if ((dataTransferInfo.uid = uid)) {
            curDataTransferInfo = dataTransferInfo;
            break;
        }
    }
    if (!curDataTransferInfo) {
        curDataTransferInfo = new DataTransferInfo();
        curDataTransferInfo.uid = uid;
        curDataTransferInfo.renderItem = resizeShareVideoFrame(videoSourceType, undefined, uid, 0, 0, 0);
    }
    return getVideoFrameDataInfo(curDataTransferInfo);
}
exports.getVideoFrameDataInfoByUid = getVideoFrameDataInfoByUid;
function getVideoFrameDataInfo(dataTransferInfo) {
    if (!dataTransferInfo) {
        return;
    }
    let finalResult = m_getVideoFrameFun(dataTransferInfo.renderItem);
    if (m_SdkType == 1) {
        if (finalResult) {
            finalResult.uid = dataTransferInfo.uid;
            finalResult.vType = 0;
        }
        return finalResult;
    }
    if (!finalResult) {
        return;
    }
    switch (finalResult.ret) {
        case 0:
            break;
        case 1:
        case 1002: {
            const { width, height, yStride, uStride, vStride } = finalResult;
            const newShareVideoFrame = resizeShareVideoFrame(dataTransferInfo.renderItem.videoSourceType, dataTransferInfo.renderItem.channelId, dataTransferInfo.renderItem.uid, width, height, yStride, uStride, vStride);
            dataTransferInfo.renderItem = newShareVideoFrame;
            finalResult = m_getVideoFrameFun(newShareVideoFrame);
            break;
        }
        case 2:
            break;
        default:
            break;
    }
    if (finalResult.ret !== 0) {
        console.debug("GetVideoFrame ret is", finalResult.ret, dataTransferInfo);
        return;
    }
    if (!finalResult.isNewFrame) {
        return;
    }
    const renderVideoFrame = dataTransferInfo.renderItem;
    if (renderVideoFrame.width > 0 && renderVideoFrame.height > 0) {
        let info = convertVideoFrameData(renderVideoFrame, finalResult.localMirrorMode);
        return info;
    }
}
electron_1.ipcRenderer.on("_initVideoRowDatasRender", (event, uid, senderId, videoType) => {
    let contentsId = senderId;
    if (m_SdkType == 0) {
        if (videoType == undefined || (videoType != 0 && videoType != 9)) {
            videoType = uid == 0 ? 0 : 9;
        }
    }
    else {
        if (videoType != 2) {
            videoType = 0;
        }
    }
    addContentsId(uid, contentsId, videoType);
});
electron_1.ipcRenderer.on("_destroyVideoRowDatasRender", (event, uid, senderId) => {
    let contentsId = senderId;
    removeContentsId(undefined, contentsId);
});
function resizeShareVideoFrame(videoSourceType, channelId, uid, width = 0, height = 0, yStride = 0, uStride = 0, vStride = 0) {
    if (typeof uid == "string") {
        uid = parseInt(uid);
    }
    if (videoSourceType == undefined) {
        if (m_SdkType == 0) {
            videoSourceType = uid == 0 ? 0 : 9;
        }
        else {
            videoSourceType = 0;
        }
    }
    if (yStride === 0) {
        yStride = width;
    }
    return {
        videoSourceType,
        channelId,
        uid,
        yBuffer: Buffer.alloc(yStride * height),
        uBuffer: Buffer.alloc((yStride * height) / 4),
        vBuffer: Buffer.alloc((yStride * height) / 4),
        width,
        height,
        yStride,
        uStride,
        vStride,
    };
}
function onGetVideoFrame(callback) {
    m_getVideoFrameFun = callback;
}
function onEnableVideoFrameCache(callback) {
    m_enableVideoFrameCacheFun = callback;
}
exports.onEnableVideoFrameCache = onEnableVideoFrameCache;
function setSdkType(sdkType) {
    m_SdkType = sdkType;
}
function init() {
    console.debug("init videoRowDataUtil");
    const time = Math.floor(1000 / 15);
    m_CheckSendVideoTimer = setInterval(() => {
        checkSendVideoRow();
    }, time);
}
init();
module.exports = {
    sendVideoRowDatas,
    removeContentsId,
    removeAll,
    addContentsId,
    onGetVideoFrame,
    resizeShareVideoFrame,
    convertVideoFrameData,
    getVideoFrameDataInfoByUid,
    onEnableVideoFrameCache,
    setSdkType,
};
//# sourceMappingURL=VideoRowDataUtil.js.map
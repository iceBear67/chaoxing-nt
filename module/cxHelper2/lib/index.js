"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDesktopWindowInfo = getDesktopWindowInfo;
exports.getAudioVolume = getAudioVolume;
exports.setAudioVolume = setAudioVolume;
exports.isAudioMuted = isAudioMuted;
exports.setAudioMute = setAudioMute;
exports.getRootDevicePath = getRootDevicePath;
exports.getFileList = getFileList;
exports.showWindow = showWindow;
exports.closeWindow = closeWindow;
exports.gobackDesktop = gobackDesktop;
exports.getWindowThumbnail = getWindowThumbnail;
exports.destroyThumbnailWindow = destroyThumbnailWindow;
exports.getClipboardFilePath = getClipboardFilePath;
let nodeFilePath = "";
if (process.platform == "darwin") {
    nodeFilePath = "../mac/CxHelperExt";
}
else if (process.platform == "win32") {
    if (process.arch == "x64") {
        nodeFilePath = "../win_x64/CxHelperExt";
    }
    else {
        nodeFilePath = "../win_ia32/CxHelperExt";
    }
}
const { GetDesktopWindowInfo, GetAudioVolume, SetAudioVolume, IsAudioMuted, AudioMute, GetRootDevicePath, GetFileList, ShowWindow, CloseWindow, GobackDesktop, GetWindowThumbnail, DestroyThumbnailWindow, GetClipboardFilePath, } = require(nodeFilePath);
/**
 * 获取桌面上所有窗口信息
 * 示例：{"height":961,"level":99999,"title":"index.js — cxstudy","width":1920,"winId":17235,"x":0,"y":25}
 * @returns
 */
function getDesktopWindowInfo() {
    let dataStr = GetDesktopWindowInfo();
    return JSON.parse(dataStr);
}
/**
 * 根据设备类型获取音频音量
 *
 * @param deviceType 0:扬声器  1：麦克风
 * @returns 返回音频音量
 */
function getAudioVolume(deviceType) {
    if (process.platform != "win32") {
        console.error("getAudioVolume only support win32");
        return 0;
    }
    return GetAudioVolume(deviceType);
}
/**
 * 设置音频设备音量
 * @param deviceType 0:扬声器  1：麦克风
 * @param value 音量 (0-100)
 * @returns
 */
function setAudioVolume(deviceType, value) {
    if (process.platform != "win32") {
        console.error("setAudioVolume only support win32");
        return 0;
    }
    return SetAudioVolume(deviceType, value);
}
/**
 * 根据设备类型获取是否静音
 *
 * @param deviceType 0:扬声器  1：麦克风
 * @returns 返回静音状态 0：未静音  1：静音
 */
function isAudioMuted(deviceType) {
    if (process.platform != "win32") {
        console.error("isAudioMuted only support win32");
        return 0;
    }
    return IsAudioMuted(deviceType);
}
/**
 *设置设备静音状态
 *
 * @param deviceType 0:扬声器  1：麦克风
 * @param value 静音状态 0：未静音  1：静音
 * @returns
 */
function setAudioMute(deviceType, value) {
    if (process.platform != "win32") {
        console.error("setAudioMute only support win32");
        return;
    }
    return AudioMute(deviceType, value);
}
/**
 * 获取磁盘根目录文件夹列表
 * @returns
 */
function getRootDevicePath() {
    if (process.platform != "win32") {
        console.error("getRootDevicePath only support win32");
        return [];
    }
    let data = GetRootDevicePath();
    if (data) {
        let rootDeviceList = [];
        try {
            rootDeviceList = JSON.parse(data);
        }
        catch (e) {
            console.error("getRootDevicePath parse error:", e);
        }
        return rootDeviceList;
    }
    return [];
}
/**
 * 根据文件路径获取文件列表
 *
 * 此函数调用了底层的文件系统访问接口 `GetFileList` 来获取指定路径下的文件信息列表
 * 它主要用于简化文件系统的信息获取过程，为上层应用提供更简洁的接口
 *
 * @param filePath 文件路径字符串，表示需要获取信息的目录或文件路径
 * @returns 返回一个 `FileInfo` 对象数组，每个对象包含单个文件的信息
 */
function getFileList(filePath) {
    if (process.platform != "win32") {
        console.error("getFileList only support win32");
        return [];
    }
    if (!filePath) {
        return [];
    }
    if (filePath.endsWith("\\")) {
        filePath = filePath.substring(0, filePath.length - 1);
    }
    let data = GetFileList(filePath);
    if (data) {
        let fileList = [];
        try {
            fileList = JSON.parse(data);
        }
        catch (e) {
            console.error("getFileList parse error:", e);
        }
        return fileList;
    }
    return [];
}
/**
 * 显示指定的窗口
 *
 * @param winId 窗口标识符，用于唯一标识一个窗口
 */
function showWindow(winId) {
    ShowWindow(winId);
}
/**
 * 关闭指定的窗口
 *
 * @param winId 窗口标识符，用于唯一标识一个窗口
 */
function closeWindow(winId) {
    CloseWindow(winId);
}
/**
 * 回到桌面
 *
 * 此函数用于触发回到桌面的操作，模拟win+D
 */
function gobackDesktop() {
    GobackDesktop();
}
/**
 * 获取窗口缩略图
 *
 * @param winId 窗口ID，用于标识特定的窗口
 * @param width 缩略图的宽度，默认值为500像素
 * @param height 缩略图的高度，默认值为300像素
 * @returns 返回一个Buffer对象，包含窗口缩略图的数据
 */
async function getWindowThumbnail(winId, width = 500, height = 300) {
    return GetWindowThumbnail(winId, width, height);
}
/**
 * 销毁生成缩略图的辅助窗口，获取完所有窗口缩略图调用
 * @returns
 */
function destroyThumbnailWindow() {
    return DestroyThumbnailWindow();
}
/**
 * 获取剪切板中的文件路径
 *
 * @returns 返回一个包含文件路径的字符串数组，如果剪切板中没有文件路径则返回空数组
 *
 */
function getClipboardFilePath() {
    let data = GetClipboardFilePath();
    if (data) {
        return JSON.parse(data);
    }
    return [];
}
// async function test() {
//   console.log("test...");
//   // let data = getFileList("F:\\temp");
//   // console.log("getFileList:", data);
//   // let data = getRootDevicePath();
//   // console.log("getRootDevicePath:", data);
//   let startTime = Date.now();
//   let data = await getWindowThumbnail(1245244);
//   console.log("getWindowThumbnail:", data);
//   let img = nativeImage.createFromBuffer(data);
//   let imgData = img.toDataURL();
//   console.log("img data:", img.toDataURL());
//   clipboard.writeImage(img);
//   // let data2 = getWindowThumbnail(1245244);
//   // console.log("getWindowThumbnail2:", data2);
//   console.log("getWindowThumbnail use time:", Date.now() - startTime);
// }
// test();
// import { desktopCapturer } from "electron"
// desktopCapturer.getSources({ types: ['window'] }).then((data) => {
//   console.log(data)
// })
// function test4() {
//   let data = getClipboardFilePath();
//   console.log("getClipboardFilePath:", data);
// }
// test4();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHIDBlackMainHelper = exports.closeHidConnect = exports.writeHidKey = exports.connectDevice = void 0;
const electron_1 = require("electron");
const node_hid_1 = require("node-hid");
let m_HidDevice;
let m_HidDatas = {
    incoming: [],
    outgoing: [],
};
let m_WebContents;
let m_UserInfo = {};
async function connectDevice() {
    if (m_HidDevice) {
        return;
    }
    let devices = await (0, node_hid_1.devicesAsync)();
    for (let device of devices) {
        if (device.path.includes("VID_2207&PID_3158") &&
            !device.path.includes("Col0")) {
            m_HidDevice = await node_hid_1.HIDAsync.open(device.path);
            console.log("连接hid设备");
            break;
        }
    }
    if (m_HidDevice) {
        m_HidDevice.on("data", (data) => {
            let hidData = getIncomingHidData(data);
            if (hidData && hidData.key == "userInfo" && !hidData.extParms) {
                return;
            }
            let receivedData = {
                code: data.toString("hex"),
            };
            if (hidData) {
                receivedData.key = hidData.key;
                receivedData.extParms = hidData.extParms;
            }
            console.log("hid 接收数据：", JSON.stringify(receivedData));
            if (m_WebContents &&
                !m_WebContents.isDestroyed() &&
                !m_WebContents.isCrashed()) {
                m_WebContents.send("_receivedHidData", receivedData);
            }
        });
        m_HidDevice.on("error", (error) => {
            console.error("hid connect error:");
            if (m_HidDevice) {
                m_HidDevice.close();
                m_HidDevice = undefined;
                setTimeout(() => {
                    connectDevice();
                }, 10000);
            }
        });
    }
}
exports.connectDevice = connectDevice;
function writeHidKey(key, code) {
    if (m_HidDevice) {
        if (key) {
            let hidData = getOutgoingHidData(key);
            if (hidData) {
                console.log("hid 发送数据：", hidData.data.toString("hex"));
                m_HidDevice.write(hidData.data);
                return;
            }
        }
        if (code) {
            console.log("hid 发送数据：", code);
            m_HidDevice.write(Buffer.from(code, "hex"));
        }
    }
}
exports.writeHidKey = writeHidKey;
electron_1.ipcMain.on("_sendHidOper", (event, data) => {
    if (data.key == "init") {
        m_WebContents = event.sender;
        writeHidKey(undefined, "0201010000000000");
    }
    else {
        writeHidKey(data.key, data.code);
    }
});
function getIncomingHidData(data) {
    if (!data || data.length == 0) {
        return;
    }
    if (data.at(0) == 0x01 &&
        (data.at(1) == 0x03 || data.at(1) == 0x04 || data.at(1) == 0x05)) {
        let dataValue = 0;
        for (let i = 2; i < data.length; i++) {
            dataValue = (dataValue << 8) | data.at(i);
        }
        if (data.at(1) == 0x03) {
            m_UserInfo.jobId = dataValue;
        }
        else if (data.at(1) == 0x04) {
            m_UserInfo.uid = dataValue;
        }
        else if (data.at(1) == 0x05) {
            m_UserInfo.fid = dataValue;
            return { key: "userInfo", data, extParms: m_UserInfo };
        }
        return { key: "userInfo", data };
    }
    for (let hidData of m_HidDatas.incoming) {
        if (data.equals(hidData.data)) {
            return hidData;
        }
    }
}
function getOutgoingHidData(key) {
    if (!key) {
        return;
    }
    for (let hidData of m_HidDatas.outgoing) {
        if (key == hidData.key) {
            return hidData;
        }
    }
}
function initHidData() {
    m_HidDatas.incoming.push({
        key: "startApp",
        data: Buffer.from([0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.incoming.push({
        key: "lessonPlan",
        data: Buffer.from([0x01, 0x01, 0x02, 0x01, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.incoming.push({
        key: "myCourse",
        data: Buffer.from([0x01, 0x01, 0x02, 0x02, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.incoming.push({
        key: "onLineClassroom",
        data: Buffer.from([0x01, 0x01, 0x02, 0x03, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.incoming.push({
        key: "signIn",
        data: Buffer.from([0x01, 0x01, 0x02, 0x04, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.incoming.push({
        key: "activity",
        data: Buffer.from([0x01, 0x01, 0x02, 0x05, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.incoming.push({
        key: "screenShare",
        data: Buffer.from([0x01, 0x01, 0x02, 0x06, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.incoming.push({
        key: "cloudDisk",
        data: Buffer.from([0x01, 0x01, 0x02, 0x07, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.incoming.push({
        key: "translation",
        data: Buffer.from([0x01, 0x01, 0x02, 0x08, 0x00, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.outgoing.push({
        key: "hasSelectedCourses",
        data: Buffer.from([0x02, 0x02, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.outgoing.push({
        key: "noSelectedCourses",
        data: Buffer.from([0x02, 0x02, 0x01, 0x01, 0x02, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.outgoing.push({
        key: "lightOn",
        data: Buffer.from([0x02, 0x02, 0x03, 0x01, 0x01, 0x00, 0x00, 0x00]),
    });
    m_HidDatas.outgoing.push({
        key: "lightOff",
        data: Buffer.from([0x02, 0x02, 0x03, 0x01, 0x02, 0x00, 0x00, 0x00]),
    });
}
function closeHidConnect() {
    if (m_HidDevice) {
        m_HidDevice.close();
    }
}
exports.closeHidConnect = closeHidConnect;
electron_1.app.on("quit", () => {
    closeHidConnect();
});
function initHIDBlackMainHelper() {
    initHidData();
    connectDevice();
}
exports.initHIDBlackMainHelper = initHIDBlackMainHelper;
//# sourceMappingURL=HIDBlackMainHelper.js.map
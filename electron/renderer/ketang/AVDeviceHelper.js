"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devUseRecords = exports.DevUseRecords = exports.DevUseRecord = void 0;
const RendererHelper_1 = require("../RendererHelper");
const MAX_RECORD_SIZE = 10;
class DevUseRecord {
    constructor() {
        this.isInit = false;
    }
    setUseDefaultDev(useDefault) {
        this.devRecordInfos.isUseDefaultDev = useDefault;
        this.followSystemPlaybackDevice(useDefault);
    }
    async init(devTag, devLisenter) {
        this.devTag = devTag;
        this.devLisenter = devLisenter;
        let recordInfos = await (0, RendererHelper_1.getSysStore)(`devRecordInfos_${devTag}`);
        if (recordInfos) {
            this.devRecordInfos = recordInfos;
        }
        else {
            this.devRecordInfos = {
                devUseList: [],
                devAllList: [],
                isUseDefaultDev: true,
            };
        }
        if (devTag == "video") {
            this.devRecordInfos.isUseDefaultDev = false;
        }
        this.isInit = true;
        let devList = this.getDevList();
        if (devList.length == 0) {
            return;
        }
        this.pushToAllRecord(devList.map((dev) => dev.deviceid));
        let useDevId = this.getDevNeedUse(devList);
        if (useDevId) {
            this.setCurDev(useDevId);
        }
    }
    pushDev(devId) {
        if (!this.isInit) {
            return;
        }
        let index = this.devRecordInfos.devUseList.indexOf(devId);
        if (index >= 0) {
            this.devRecordInfos.devUseList.splice(index, 1);
        }
        this.devRecordInfos.devUseList.push(devId);
        while (this.devRecordInfos.devUseList.length > MAX_RECORD_SIZE) {
            this.devRecordInfos.devUseList.shift();
        }
        this.saveDevRecords();
    }
    pushToAllRecord(devids) {
        devids.forEach((devid) => {
            if (!this.devRecordInfos.devAllList.includes(devid)) {
                this.devRecordInfos.devAllList.push(devid);
            }
        });
        this.saveDevRecords();
    }
    curDev() {
        if (!this.isInit) {
            return;
        }
        if (this.devTag == "audio") {
            return this.devLisenter.getCurAudioDev();
        }
        else if (this.devTag == "video") {
            return this.devLisenter.getCurVideoDev();
        }
        else if (this.devTag == "speaker") {
            return this.devLisenter.getCurSpeakerDev();
        }
    }
    useDev(devId, defaultDevId) {
        if (!this.isInit) {
            return;
        }
        if (devId == DevUseRecord.DEFALUT_DEV_ID) {
            this.setUseDefaultDev(true);
            this.saveDevRecords();
            if (defaultDevId) {
                return this.setCurDev(defaultDevId);
            }
            else {
                defaultDevId = this.getDevNeedUse();
                if (defaultDevId) {
                    return this.setCurDev(defaultDevId);
                }
            }
        }
        else {
            this.setUseDefaultDev(false);
            this.pushDev(devId);
            return this.setCurDev(devId);
        }
    }
    onDevAdd(devId) {
        if (!this.isInit) {
            return;
        }
        if (!this.devRecordInfos.isUseDefaultDev) {
            if (!this.devRecordInfos.devAllList.includes(devId)) {
                this.showNewDevDialog(devId);
                this.pushToAllRecord([devId]);
            }
        }
        else {
            let defaultDevId = this.defaultDev();
            if (defaultDevId) {
                let curDev = this.curDev();
                if (curDev != defaultDevId) {
                    this.setCurDev(defaultDevId);
                }
            }
        }
    }
    onDevRemoved(devId) {
        if (!this.isInit) {
            return;
        }
        if (this.curUseDevId == devId) {
            let useDevId = this.getDevNeedUse();
            if (useDevId) {
                this.setCurDev(useDevId);
            }
        }
    }
    showNewDevDialog(devId) {
        if (!this.isInit) {
            return;
        }
        if (this.devTag == "audio") {
            this.devLisenter.showNewAudioDevDialog(devId);
        }
        else if (this.devTag == "speaker") {
            this.devLisenter.showNewSpeakerDevDialog(devId);
        }
    }
    getDevList() {
        if (this.devTag == "audio") {
            return this.devLisenter.getAudioDevList();
        }
        else if (this.devTag == "speaker") {
            return this.devLisenter.getSpeakerDevList();
        }
        else if (this.devTag == "video") {
            return this.devLisenter.getVideoDevList();
        }
    }
    getDevNeedUse(devList) {
        if (!this.isInit) {
            return;
        }
        if (!devList) {
            devList = this.getDevList();
        }
        if (this.devRecordInfos.isUseDefaultDev) {
            let useDevId = this.defaultDev(devList);
            if (!useDevId) {
                useDevId = this.lastDevCanUse(devList);
            }
            if (!useDevId) {
                useDevId = devList[0].deviceid;
            }
            return useDevId;
        }
        else {
            let useDevId = this.lastDevCanUse(devList);
            if (!useDevId) {
                useDevId = this.defaultDev(devList);
            }
            if (!useDevId) {
                useDevId = devList[0].deviceid;
            }
            return useDevId;
        }
    }
    defaultDev(devList) {
        if (!devList) {
            devList = this.getDevList();
        }
        if (devList?.length > 0) {
            let defaultDev = devList.find((dev) => dev.isSystemDefault == 1);
            return defaultDev?.deviceid;
        }
    }
    lastDevCanUse(devList) {
        if (!devList) {
            devList = this.getDevList();
        }
        if (!devList || devList.length == 0) {
            return;
        }
        if (!this.devRecordInfos.devUseList ||
            this.devRecordInfos.devUseList.length == 0) {
            return;
        }
        for (let i = this.devRecordInfos.devUseList.length - 1; i >= 0; i--) {
            let devRecord = this.devRecordInfos.devUseList[i];
            let lastDev = devList.find((dev) => dev.deviceid == devRecord);
            if (lastDev) {
                return lastDev.deviceid;
            }
        }
    }
    setCurDev(devId) {
        if (!this.isInit) {
            return;
        }
        this.curUseDevId = devId;
        if (this.devTag == "audio") {
            return this.devLisenter.setCurAudioDev(devId);
        }
        else if (this.devTag == "speaker") {
            return this.devLisenter.setCurSpeakerDev(devId);
        }
        else if (this.devTag == "video") {
            return this.devLisenter.setCurVideoDev(devId);
        }
    }
    followSystemPlaybackDevice(enable) {
        if (this.devTag == "audio") {
            return this.devLisenter.followSystemRecordingDevice(enable);
        }
        else if (this.devTag == "speaker") {
            return this.devLisenter.followSystemPlaybackDevice(enable);
        }
    }
    saveDevRecords() {
        (0, RendererHelper_1.setSysStore)(`devRecordInfos_${this.devTag}`, this.devRecordInfos);
    }
    checkDefaultDevChanged() {
        if (!this.devRecordInfos.isUseDefaultDev) {
            return;
        }
        let devList = this.getDevList();
        if (devList?.length > 0) {
            let defaultDev = devList.find((dev) => dev.isSystemDefault == 1);
            if (defaultDev) {
                if (this.curDefaultDevId &&
                    this.curDefaultDevId != defaultDev?.deviceid) {
                    this.setCurDev(defaultDev?.deviceid);
                }
                this.curDefaultDevId = defaultDev?.deviceid;
            }
        }
    }
}
exports.DevUseRecord = DevUseRecord;
DevUseRecord.DEFALUT_DEV_ID = "default";
class DevUseRecords {
    async init(devLisenter) {
        this.audioDev = new DevUseRecord();
        await this.audioDev.init("audio", devLisenter);
        this.speakerDev = new DevUseRecord();
        await this.speakerDev.init("speaker", devLisenter);
        this.videoDev = new DevUseRecord();
        await this.videoDev.init("video", devLisenter);
    }
}
exports.DevUseRecords = DevUseRecords;
exports.devUseRecords = new DevUseRecords();
//# sourceMappingURL=AVDeviceHelper.js.map
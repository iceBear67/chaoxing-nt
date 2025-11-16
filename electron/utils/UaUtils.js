"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUserAgentInfo = exports.UaInfo = void 0;
class UaInfo {
}
exports.UaInfo = UaInfo;
function parseUserAgentInfo(userAgent) {
    const uainfoDatas = [];
    if (userAgent.trim() === "") {
        return;
    }
    const regex = /.*ChaoXingStudy_(\d+)_(\d+[^_]*)_([^_]*)_([^_]*)_([^_]*)_([^ ]*)?( \([^)]*\))?.*_(.*[-]?\w+).*/;
    const matcher = userAgent.match(regex);
    if (matcher && matcher.length > 0) {
        for (let i = 1; i < matcher.length; i++) {
            uainfoDatas.push(matcher[i]);
        }
    }
    let uaInfo = new UaInfo();
    uaInfo.apiVersion = parseInt(uainfoDatas[5]);
    uaInfo.buildVersion = uainfoDatas[4];
    uaInfo.productId = uainfoDatas[0];
    uaInfo.appVersion = uainfoDatas[1];
    uaInfo.deviceId = uainfoDatas[7];
    return uaInfo;
}
exports.parseUserAgentInfo = parseUserAgentInfo;
//# sourceMappingURL=UaUtils.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRtcSdk = exports.RtcConnection = void 0;
class RtcConnection {
}
exports.RtcConnection = RtcConnection;
function createRtcSdk(type = 0) {
    if (type == 0) {
        const AgoraSdk = require("./AgoraSdk").default;
        return new AgoraSdk();
    }
    else {
        const RkSdk = require("./RkSdk");
        return new RkSdk();
    }
}
exports.createRtcSdk = createRtcSdk;
//# sourceMappingURL=RtcSdk.js.map
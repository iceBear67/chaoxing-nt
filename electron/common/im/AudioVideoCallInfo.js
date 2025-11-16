"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallToDevInfo = exports.CallInfo = exports.CallRole = exports.EndReson = exports.CallState = exports.IM_DOMAIN = void 0;
exports.IM_DOMAIN = "https://im.chaoxing.com";
var CallState;
(function (CallState) {
    CallState[CallState["State_Idle"] = 0] = "State_Idle";
    CallState[CallState["State_Invite"] = 1] = "State_Invite";
    CallState[CallState["State_Confirm"] = 2] = "State_Confirm";
    CallState[CallState["State_Connecting"] = 3] = "State_Connecting";
    CallState[CallState["State_Connected"] = 4] = "State_Connected";
    CallState[CallState["State_End"] = 5] = "State_End";
})(CallState || (exports.CallState = CallState = {}));
var EndReson;
(function (EndReson) {
    EndReson[EndReson["EndReson_Unknown"] = 0] = "EndReson_Unknown";
    EndReson[EndReson["EndReson_Busy"] = 1] = "EndReson_Busy";
    EndReson[EndReson["EndReson_Cancel"] = 2] = "EndReson_Cancel";
    EndReson[EndReson["EndReson_Reject"] = 3] = "EndReson_Reject";
    EndReson[EndReson["EndReson_Timeout"] = 4] = "EndReson_Timeout";
    EndReson[EndReson["EndReson_Hangup"] = 5] = "EndReson_Hangup";
})(EndReson || (exports.EndReson = EndReson = {}));
var CallRole;
(function (CallRole) {
    CallRole[CallRole["Initiator"] = 0] = "Initiator";
    CallRole[CallRole["Recipient"] = 1] = "Recipient";
})(CallRole || (exports.CallRole = CallRole = {}));
class CallInfo {
}
exports.CallInfo = CallInfo;
function getCallToDevInfo(callInfo) {
    if (!callInfo) {
        return null;
    }
    if (callInfo.role === CallRole.Initiator) {
        return callInfo.calleeInfo;
    }
    else {
        return callInfo.callerInfo;
    }
}
exports.getCallToDevInfo = getCallToDevInfo;
//# sourceMappingURL=AudioVideoCallInfo.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAudioFrameData = exports.setRtcSdkForAudioFrame = exports.setAudioFrameLisenter = void 0;
const RendererHelper_1 = require("../RendererHelper");
const RendererHelper = __importStar(require("../RendererHelper"));
const index_1 = require("../../../module/agoraAudioPlugin/lib/index");
let m_WebContentsId = -1;
let m_RtcSdk;
let m_loadAudoFrameTimer;
let m_AudioFrameLisenter;
function setAudioFrameLisenter(lisenter) {
    m_AudioFrameLisenter = lisenter;
}
exports.setAudioFrameLisenter = setAudioFrameLisenter;
function setRtcSdkForAudioFrame(rtcSdk) {
    m_RtcSdk = rtcSdk;
}
exports.setRtcSdkForAudioFrame = setRtcSdkForAudioFrame;
RendererHelper.on("initReceiveAudioFrame", (contentsParm) => {
    console.debug("initReceiveAudioFrame:contentsParm:", contentsParm);
    if (contentsParm && contentsParm._fromWebContentsId) {
        if (m_RtcSdk) {
            m_WebContentsId = contentsParm._fromWebContentsId;
            if (m_loadAudoFrameTimer) {
                clearInterval(m_loadAudoFrameTimer);
                m_loadAudoFrameTimer = undefined;
            }
            (0, index_1.enabledRawDataPlugin)(m_RtcSdk.getRtcEngin());
            m_loadAudoFrameTimer = setInterval(async () => {
                let audioFrameList = (0, index_1.loadAudioFrameData)();
                if (audioFrameList.length > 0) {
                    for (let audioFrame of audioFrameList) {
                        if (m_AudioFrameLisenter) {
                            audioFrame.username = await m_AudioFrameLisenter.getUserName(audioFrame.uid + "");
                        }
                    }
                    sendAudioFrameData(audioFrameList);
                }
            }, 300);
        }
    }
});
function sendAudioFrameData(data) {
    console.debug("sendAudioFrameData:", new Date().toISOString(), data);
    if (m_WebContentsId > 0) {
        (0, RendererHelper_1.sendToWebContents)("rtcAudioFrameData", m_WebContentsId, data).then((result) => {
            if (result == -1) {
                if (m_loadAudoFrameTimer) {
                    clearInterval(m_loadAudoFrameTimer);
                    m_loadAudoFrameTimer = undefined;
                }
                (0, index_1.disableRawDataPlugin)();
                m_WebContentsId = -1;
            }
        });
    }
}
exports.sendAudioFrameData = sendAudioFrameData;
//# sourceMappingURL=AudioFrameHelper.js.map
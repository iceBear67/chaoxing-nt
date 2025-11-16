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
const { ipcRenderer } = require("electron");
const RendererHelper = __importStar(require("../RendererHelper"));
const Renderer_1 = require("./Renderer");
let channel = "kchaoxing";
class RendererSdk {
    constructor() {
        this.isLoadRotateCss = false;
        this.renderMode = this._checkWebGL() && this._checkWebGL2() ? 1 : 2;
        this.streams = new Map();
        this.customRenderer = Renderer_1.CustomRenderer;
    }
    _checkWebGL() {
        const canvas = document.createElement("canvas");
        let gl;
        canvas.width = 1;
        canvas.height = 1;
        const options = {
            alpha: false,
            depth: false,
            stencil: false,
            antialias: false,
            preferLowPowerToHighPerformance: true,
        };
        try {
            gl =
                canvas.getContext("webgl", options) ||
                    canvas.getContext("experimental-webgl", options);
        }
        catch (e) {
            return false;
        }
        if (gl) {
            return true;
        }
        else {
            return false;
        }
    }
    _checkWebGL2() {
        var canvas = document.createElement("canvas"), gl;
        canvas.width = 1;
        canvas.height = 1;
        var options = {
            preferLowPowerToHighPerformance: true,
            powerPreference: "low-power",
            failIfMajorPerformanceCaveat: true,
            preserveDrawingBuffer: true,
        };
        try {
            gl =
                canvas.getContext("webgl", options) ||
                    canvas.getContext("experimental-webgl", options);
        }
        catch (e) {
            return false;
        }
        if (gl) {
            return true;
        }
        else {
            return false;
        }
    }
    initRender(key, view, channelId, options, contentMode) {
        const initRenderFailCallBack = (renderMode, renderDescription = "initRender") => {
            try {
                console.warn(`info:${renderDescription}  fail, change remderMode to ${renderMode}`);
                console.warn("key:", key, " view:", view, " channelId:", channelId, " options:", options);
                this.renderMode = renderMode;
                this.destroyRender(key, channelId, () => { });
                this.initRender(key, view, channelId, options, contentMode);
            }
            catch (error) {
                console.log("initRenderFailCallBack", error);
            }
        };
        let rendererOptions = {
            append: options ? options.append : false,
        };
        let channelStreams = this._getChannelRenderers(channelId || "");
        if (channelStreams.has(String(key))) {
            if (!rendererOptions.append) {
                this.destroyRender(key, channelId || "");
            }
            else {
                let renderers = channelStreams.get(String(key)) || [];
                for (let i = 0; i < renderers.length; i++) {
                    if (renderers[i].equalsElement(view)) {
                        console.log(`view exists in renderer list, ignore`);
                        return;
                    }
                }
            }
        }
        channelStreams = this._getChannelRenderers(channelId || "");
        let renderer;
        if (this.renderMode === 1) {
            renderer = new Renderer_1.GlRenderer({ initRenderFailCallBack });
            renderer.bind(view, true);
        }
        else if (this.renderMode === 2) {
            renderer = new Renderer_1.SoftwareRenderer();
            renderer.bind(view, false);
        }
        else if (this.renderMode === 3) {
            renderer = new this.customRenderer();
            renderer.bind(view, false);
        }
        else if (this.renderMode === 4) {
            renderer = new Renderer_1.SoftwareRenderer();
            renderer.bind(view, true);
        }
        else {
            console.warn("Unknown render mode, fallback to 1");
            renderer = new Renderer_1.SoftwareRenderer();
            renderer.bind(view, false);
        }
        renderer.rView = view;
        if (contentMode) {
            renderer.setContentMode(contentMode);
        }
        if (!rendererOptions.append) {
            channelStreams.set(String(key), [renderer]);
        }
        else {
            let renderers = channelStreams.get(String(key)) || [];
            renderers.push(renderer);
            channelStreams.set(String(key), renderers);
        }
        if (!this.isLoadRotateCss) {
            this.loadCssCode(".rotateY0  {transform: rotateY(0deg) !important;}\n.rotateY180  {transform: rotateY(180deg) !important;}");
            this.isLoadRotateCss = true;
        }
        this.localMirrorMode = undefined;
    }
    destroyRender(key, channelId, onFailure) {
        let channelStreams = this._getChannelRenderers(channelId || "");
        if (!channelStreams.has(String(key))) {
            return;
        }
        const renderers = channelStreams.get(String(key)) || [];
        let exception = null;
        for (let i = 0; i < renderers.length; i++) {
            let renderer = renderers[i];
            try {
                renderer.unbind();
                channelStreams.delete(String(key));
                if (channelStreams.size === 0) {
                    this.streams.delete(channelId || "");
                }
            }
            catch (err) {
                exception = err;
                console.error(`${err.stack}`);
            }
        }
        if (exception) {
            onFailure && onFailure(exception);
        }
    }
    destroyRenderView(key, channelId, view, onFailure) {
        let channelStreams = this._getChannelRenderers(channelId || "");
        if (!channelStreams.has(String(key))) {
            return;
        }
        const renderers = channelStreams.get(String(key)) || [];
        const matchRenderers = renderers.filter((renderer) => renderer.equalsElement(view));
        const otherRenderers = renderers.filter((renderer) => !renderer.equalsElement(view));
        if (matchRenderers.length > 0) {
            let renderer = matchRenderers[0];
            try {
                renderer.unbind();
                if (otherRenderers.length > 0) {
                    channelStreams.set(String(key), otherRenderers);
                }
                else {
                    channelStreams.delete(String(key));
                }
                if (channelStreams.size === 0) {
                    this.streams.delete(channelId || "");
                }
            }
            catch (err) {
                onFailure && onFailure(err);
            }
        }
    }
    _getChannelRenderers(channelId) {
        let channel;
        if (!this.streams.has(channelId)) {
            channel = new Map();
            this.streams.set(channelId, channel);
        }
        else {
            channel = this.streams.get(channelId);
        }
        return channel;
    }
    resizeRender(key, channelId) {
        let channelStreams = this._getChannelRenderers(channelId || "");
        if (channelStreams.has(String(key))) {
            const renderers = channelStreams.get(String(key)) || [];
            renderers.forEach((renderer) => renderer.refreshCanvas());
        }
    }
    onRegisterDeliverFrame(infos) {
        const len = infos.length;
        for (let i = 0; i < len; i++) {
            const info = infos[i];
            const { type, uid, channelId, header, ydata, udata, vdata, localMirrorMode, yStride, } = info;
            let changeRotate = false;
            if (uid === 0 && localMirrorMode !== this.localMirrorMode) {
                this.localMirrorMode = localMirrorMode;
                changeRotate = true;
            }
            if (!header || !ydata || !udata || !vdata) {
                console.log("Invalid data param ： " +
                    header +
                    " " +
                    ydata +
                    " " +
                    udata +
                    " " +
                    vdata);
                continue;
            }
            const renderers = this._getRenderers(type, uid, channelId);
            if (!renderers || renderers.length === 0) {
                console.warn(`Can't find renderer for uid : ${uid} ${channelId}`);
                continue;
            }
            if (this._checkData(header, ydata, udata, vdata)) {
                renderers.forEach((renderer) => {
                    if (changeRotate && renderer.rView) {
                        if (this.localMirrorMode) {
                            renderer.rView?.classList.remove("rotateY0");
                            renderer.rView?.classList.add("rotateY180");
                        }
                        else {
                            renderer.rView?.classList.remove("rotateY180");
                            renderer.rView?.classList.add("rotateY0");
                        }
                    }
                    renderer.drawFrame({
                        header,
                        yUint8Array: ydata,
                        uUint8Array: udata,
                        vUint8Array: vdata,
                        yStride,
                    });
                });
            }
        }
    }
    _getRenderers(type, uid, channelId) {
        let channelStreams = this._getChannelRenderers(channelId || "");
        if (type < 2) {
            if (uid === 0) {
                return channelStreams.get("local");
            }
            else {
                return channelStreams.get(String(uid));
            }
        }
        else if (type === 2) {
            return channelStreams.get(String(uid));
        }
        else if (type === 3) {
            return channelStreams.get("videosource");
        }
        else {
            console.warn("Invalid type for getRenderer, only accept 0~3.");
            return;
        }
    }
    _checkData(header, ydata, udata, vdata) {
        if (header.byteLength != 20) {
            console.error("invalid image header " + header.byteLength);
            return false;
        }
        if (ydata.byteLength === 20) {
            console.error("invalid image yplane " + ydata.byteLength);
            return false;
        }
        if (udata.byteLength === 20) {
            console.error("invalid image uplanedata " + udata.byteLength);
            return false;
        }
        if (ydata.byteLength != udata.byteLength * 4 ||
            udata.byteLength != vdata.byteLength) {
            console.error("invalid image header " +
                ydata.byteLength +
                " " +
                udata.byteLength +
                " " +
                vdata.byteLength);
            return false;
        }
        return true;
    }
    loadCssCode(code) {
        var style = document.createElement("style");
        try {
            style.appendChild(document.createTextNode(code));
        }
        catch (ex) {
        }
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(style);
    }
}
let AgoraSdk = new RendererSdk();
function initRender(uid, viewId, videoType, contentMode) {
    let view;
    console.log("initRender:", uid);
    if (typeof viewId == "string") {
        view = document.getElementById(viewId);
    }
    else {
        view = viewId;
    }
    let key;
    if (typeof uid == "number") {
        if (uid === 0) {
            key = "local";
        }
        else {
            key = uid + "";
        }
    }
    else {
        key = uid;
    }
    AgoraSdk.initRender(key, view, channel, undefined, contentMode);
    RendererHelper.sendToMainProcess("_initVideoRowDatasRender", uid, videoType);
}
function resizeRender(uid) {
    let key;
    if (typeof uid == "number") {
        if (uid === 0) {
            key = "local";
        }
        else {
            key = uid + "";
        }
    }
    else {
        key = uid;
    }
    AgoraSdk.resizeRender(key, channel);
}
function onRegisterDeliverFrame(info) {
    if (info) {
        info.channelId = channel;
    }
    AgoraSdk.onRegisterDeliverFrame([info]);
}
function destroyRender(uid, videoType) {
    let key;
    if (typeof uid == "number") {
        if (uid === 0) {
            key = "local";
        }
        else {
            key = uid + "";
        }
    }
    else {
        key = uid;
    }
    AgoraSdk.destroyRender(key, channel);
    RendererHelper.sendToMainProcess("_destroyVideoRowDatasRender", uid, videoType);
}
ipcRenderer.on("_sendVideoRowDatas", (event, info) => {
    onRegisterDeliverFrame(info);
});
module.exports = {
    initRender,
    resizeRender,
    onRegisterDeliverFrame,
    destroyRender,
};
//# sourceMappingURL=VideoRowDataRendererHelper.js.map
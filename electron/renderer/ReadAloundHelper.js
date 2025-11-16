"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertReadAloundText = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const appconfig = require("../config/appconfig.json");
function insertCss() {
    const textSelectReadCssPath = path_1.default.join(__dirname, "../../html/css/textSelectRead.css");
    const textSelectReadCss = fs_1.default.readFileSync(textSelectReadCssPath, {
        encoding: "utf8",
    });
    electron_1.webFrame.insertCSS(textSelectReadCss);
}
function insertHtml() {
    const textSelectReadHtmlPath = path_1.default.join(__dirname, "../../html/textSelectRead.html");
    const textSelectReadHtml = fs_1.default.readFileSync(textSelectReadHtmlPath, {
        encoding: "utf8",
    });
    const parser = new DOMParser();
    const textSelectReadHtmlData = parser.parseFromString(textSelectReadHtml, "text/html");
    const childrens = textSelectReadHtmlData.body.children;
    while (childrens.length > 0) {
        document.body.appendChild(childrens[0]);
    }
}
function parseJsonStringOrObject(data) {
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            console.error("数据不是有效的 JSON 字符串");
            return null;
        }
    }
    else {
        return data;
    }
}
let ktBoardMark;
function addMouseEvent() {
    const controlBtnElement = document.getElementById("ktboard_control_btn");
    const divElement = document.getElementById("ktboard_partCommentBtn");
    const controlCloseElement = document.getElementById("ktboard_control_btn_close");
    const CommentCloseElement = document.getElementById("ktboard_partCommentBtn_close");
    ktBoardMark = {
        applier: null,
        audioPlayer: null,
        audioQueue: [],
        isPlaying: false,
        cachedAudioElements: [],
        isPlayEnd: true,
        init: function () {
        },
        handleAudioCallback: function (url) {
            const audio = new Audio(url);
            audio.onended = this.handleAudioEnd.bind(this);
            if (this.isPlaying) {
                this.audioQueue.push(audio);
            }
            else {
                this.playAudio(audio);
            }
        },
        playAudio: function (audio) {
            this.isPlaying = true;
            this.audioPlayer = audio;
            this.audioPlayer.play();
            if (!this.cachedAudioElements.some(audioInstance => audioInstance === audio)) {
                this.cachedAudioElements.push(audio);
            }
        },
        handleAudioEnd: function () {
            this.audioPlayer = null;
            this.isPlaying = false;
            console.log(this.audioQueue);
            if (this.audioQueue.length > 0) {
                const nextAudio = this.audioQueue.shift();
                this.playAudio(nextAudio);
            }
            else {
                divElement.style.display = "inline-flex";
                controlBtnElement.style.display = "none";
                controlCloseElement.style.display = "none";
                CommentCloseElement.style.display = "block";
                console.log('所有音频已经播放完毕');
            }
        },
        controlAudio: function () {
            if (this.audioPlayer) {
                if (this.audioPlayer.paused) {
                    this.audioPlayer.play();
                }
                else {
                    this.audioPlayer.pause();
                }
            }
            else if (this.audioQueue.length > 0) {
                const nextAudio = this.audioQueue.shift();
                this.playAudio(nextAudio);
            }
        }
    };
    divElement.addEventListener("click", function (e) {
        console.log("按钮被点击了！");
        divElement.style.display = "none";
        controlBtnElement.style.display = "flex";
        controlCloseElement.style.display = "block";
        CommentCloseElement.style.display = "none";
        document.querySelector('#ktboard_control_btn .playing').classList.add("kt_show");
        if (ktBoardMark.cachedAudioElements.length) {
            ktBoardMark.audioQueue = ktBoardMark.cachedAudioElements.slice();
            ktBoardMark.cachedAudioElements = [];
            const audio = ktBoardMark.audioQueue.shift();
            ktBoardMark.playAudio(audio);
        }
        e.preventDefault();
        e.stopPropagation();
    });
    controlCloseElement.addEventListener("click", function (e) {
        resetEvent();
        console.log('重置了2');
        e.preventDefault();
        e.stopPropagation();
    });
    CommentCloseElement.addEventListener("click", function (e) {
        resetEvent();
        console.log('重置了1');
        e.preventDefault();
        e.stopPropagation();
    });
    document.querySelector('#ktboard_control_btn .playing').addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector('#ktboard_control_btn .playing').classList.remove("kt_show");
        document.querySelector('#ktboard_control_btn .pause').classList.add("kt_show");
        ktBoardMark.controlAudio();
    });
    document.querySelector('#ktboard_control_btn .pause').addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector('#ktboard_control_btn .pause').classList.remove("kt_show");
        document.querySelector('#ktboard_control_btn .playing').classList.add("kt_show");
        ktBoardMark.controlAudio();
    });
}
function insertReadAloundText() {
    if (appconfig.appMode != "fanya") {
        return;
    }
    insertHtml();
    insertCss();
    console.log("insertReadAloundText");
    addMouseEvent();
}
exports.insertReadAloundText = insertReadAloundText;
function resetEvent() {
    ktBoardMark.audioPlayer?.pause();
    ktBoardMark.audioPlayer = null;
    ktBoardMark.audioQueue = [];
    ktBoardMark.isPlaying = false;
    ktBoardMark.cachedAudioElements = [];
    ktBoardMark.isPlayEnd = true;
    document.getElementById("ktboard_control_btn").style.display = "none";
    document.querySelector('#ktboard_control_btn .playing').classList.remove("kt_show");
    document.querySelector('#ktboard_control_btn .pause').classList.remove("kt_show");
    document.getElementById("ktboard_partCommentBtn").style.display = "none";
    document.getElementById("ktboard_partCommentBtn_close").style.display = "none";
    document.getElementById("ktboard_control_btn_close").style.display = "none";
}
electron_1.ipcRenderer.on("_readAloudText_preload", (event, data) => {
    console.log("_readAloudText_preload:");
    resetEvent();
    const controlBtnElement = document.getElementById("ktboard_control_btn");
    const divElement = document.getElementById("ktboard_partCommentBtn");
    const controlCloseElement = document.getElementById("ktboard_control_btn_close");
    const CommentCloseElement = document.getElementById("ktboard_partCommentBtn_close");
    divElement.style.top = data.y + 'px';
    divElement.style.left = data.x + 'px';
    controlBtnElement.style.top = data.y + 'px';
    controlBtnElement.style.left = data.x + 'px';
    controlCloseElement.style.top = data.y - 7 + 'px';
    controlCloseElement.style.left = data.x + 22 + 'px';
    CommentCloseElement.style.top = data.y - 6 + 'px';
    CommentCloseElement.style.left = data.x + 40 + 'px';
    divElement.style.display = "none";
    controlBtnElement.style.display = "flex";
    controlCloseElement.style.display = "block";
    ktBoardMark.isPlayEnd = false;
    document.querySelector('#ktboard_control_btn .playing').classList.add("kt_show");
    electron_1.ipcRenderer.on(`_readAloudText_progress_${data.id}`, (event, resData) => {
        if (ktBoardMark.isPlayEnd) {
            ktBoardMark.isPlayEnd = true;
            return;
        }
        console.log("朗读中：", resData);
        ktBoardMark.handleAudioCallback(resData.audioUrl);
    });
    electron_1.ipcRenderer.once(`_readAloudText_result_${data.id}`, (event, resData) => {
        electron_1.ipcRenderer.removeAllListeners(`_readAloudText_progress_${data.id}`);
        ktBoardMark.isPlayEnd = true;
        console.log("朗读语音链接获取完毕：", resData);
    });
});
module.exports = { insertReadAloundText };
//# sourceMappingURL=ReadAloundHelper.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAloudText = exports.readAloudTextBak = void 0;
const electron_1 = require("electron");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const UserHelper_1 = require("./UserHelper");
const NetUtil_1 = require("./util/NetUtil");
const ws_1 = require("ws");
const READ_ALOUD_URL = "https://test-ai-man.chaoxing.com/front/porxy/audition/digitMan/test/";
function get_infenc_md5(uid, _time, token) {
    const key = "DF469779279D4B5D5F2FD5FE785038E5";
    let res = `uid=${uid}&_time=${_time}&token=${token}&_key=${key}`;
    return (0, CryptoUtil_1.md5)(res);
}
function segmentText(text) {
    let words = [];
    const regex = /[，。；;”\n]/;
    while (true) {
        let foundIndex = text.search(regex);
        if (foundIndex > -1) {
            let subIndex = foundIndex + 1;
            let subWord = text.substring(0, subIndex);
            if (subWord.trim().length > 0) {
                words.push(subWord);
            }
            text = text.substring(subIndex);
        }
        else {
            if (text.trim().length > 0) {
                words.push(text);
            }
            break;
        }
    }
    return words;
}
function handleText(text) {
    if (!text || text.trim().length == 0) {
        return [];
    }
    let maxTextSize = 50;
    let result = [];
    function pushToNewArray(subText) {
        result.push(subText);
        if (result.length > 10) {
            maxTextSize = 500;
        }
        else if (result.length > 5) {
            maxTextSize = 300;
        }
        else if (result.length > 3) {
            maxTextSize = 200;
        }
        else if (result.length > 2) {
            maxTextSize = 100;
        }
    }
    let texts = segmentText(text);
    let tempText = "";
    for (let i = 0; i < texts.length; i++) {
        let temp = texts[i];
        let temp2 = tempText + temp;
        if (temp2.length < maxTextSize) {
            tempText = temp2;
        }
        else {
            if (tempText.trim().length > 0) {
                pushToNewArray(tempText);
                tempText = "";
                i--;
            }
            else {
                while (temp.length > maxTextSize) {
                    let temp3 = temp.substring(0, maxTextSize);
                    temp = temp.substring(maxTextSize);
                    pushToNewArray(temp3);
                }
                if (temp.length > 0) {
                    tempText = temp;
                }
            }
        }
    }
    if (tempText.trim().length > 0) {
        pushToNewArray(tempText.trim());
    }
    return result;
}
async function readAloudTextBak(text, callback) {
    if (!text || text.trim().length == 0) {
        return { ruesult: -1 };
    }
    let subTexts = handleText(text);
    if (!subTexts || subTexts.length == 0) {
        return { ruesult: -1 };
    }
    for (let i = 0; i < subTexts.length; i++) {
        let res = await readAloudTextPart(subTexts[i]);
        if (res?.result == 1) {
            callback(res);
        }
        else {
            return { ruesult: -1 };
        }
    }
    return { ruesult: 1 };
}
exports.readAloudTextBak = readAloudTextBak;
async function readAloudTextPart(text) {
    let uid = (0, UserHelper_1.getUID)();
    if (!uid) {
        return { ruesult: -1 };
    }
    const token = "279D4B5D5F2FD5FE";
    const time = new Date().getTime();
    let enc = get_infenc_md5(uid, time, token);
    let url = `${READ_ALOUD_URL}?token=${token}&timestamp=${time}&uid=${uid}&inf_enc=${enc}&text=${text}`;
    console.debug(`readAloudText url:`, url);
    let netResponse = await (0, NetUtil_1.netRequestGet)(url);
    if (netResponse.ok) {
        console.debug(`readAloudText:text:${text},responseText:`, netResponse.text());
        return {
            result: 1,
            text,
            audioUrl: netResponse.text().replace(/^"|"$/g, ""),
        };
    }
    else {
        return { result: -1 };
    }
}
electron_1.ipcMain.handle("_readAloudText", (event, text, id) => {
    return readAloudText(text, (resData) => {
        if (!event.sender.isDestroyed() && !event.sender.isCrashed()) {
            if (event.senderFrame) {
                event.senderFrame.send(`_readAloudText_progress_${id}`, resData);
            }
            else {
                event.sender.send(`_readAloudText_progress_${id}`, resData);
            }
        }
    });
});
async function readAloudText(text, callback) {
    let uid = (0, UserHelper_1.getUID)();
    let id = `${uid}_${new Date().getTime()}`;
    const url = `wss://test-ai-man.chaoxing.com/exchange/?Type=fs&ID=${id}`;
    return new Promise((resolve, reject) => {
        const ws = new ws_1.WebSocket(url);
        ws.on("open", () => {
            console.log("connect to readAloudServer:", url);
            ws.send(text);
        });
        ws.on("close", () => {
            console.info("readAloudServer closed");
            resolve(true);
        });
        ws.on("error", (err) => {
            console.info("readAloudServer error:", err);
            resolve(false);
        });
        ws.on("message", (data, isBinary) => {
            if (!isBinary) {
                let result = JSON.parse(data.toString());
                if (result.code == 200 && result.data == "end") {
                    resolve(true);
                    ws.close();
                }
            }
            else {
                callback(data);
            }
        });
    });
}
exports.readAloudText = readAloudText;
function test() {
    readAloudText(`注：DC原创文章，转载需取得权限。

  目录

  简介
  安装与运行
  主面板(Notebook Dashboard)
  编辑界面(Notebook Editor)
  单元(Cell)
  魔法函数
  其他
 `, (resData) => {
        console.log("resData:", resData);
    });
}
module.exports = { readAloudText };
//# sourceMappingURL=ReadAloudMainHelper.js.map
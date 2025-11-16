"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendQuestion = void 0;
const electron_1 = require("electron");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const UserHelper_1 = require("./UserHelper");
const AxiosUtil_1 = require("../utils/AxiosUtil");
const Robot_QA_URL = "https://robot1.chaoxing.com";
function get_infenc_md5(question) {
    const key = "4a1e131bd4f6b1f779efed0134c34ef3";
    let res = `${key}${question}`;
    return (0, CryptoUtil_1.md5)(res);
}
const TIMEOUT = 10000;
const config = {
    headers: {
        "Content-Type": "application/json",
    },
};
const responseType = "json";
const instance = new AxiosUtil_1.AxiosUtil(Robot_QA_URL, TIMEOUT, responseType);
function sendQuestion(text) {
    return new Promise((resolve, reject) => {
        let uid = (0, UserHelper_1.getUID)();
        if (!uid) {
            return { ruesult: -1 };
        }
        let enc = get_infenc_md5(JSON.stringify({ content: text }));
        instance
            .post(`/v1/api/robotQA/sendQues/`, {
            question: {
                content: text
            },
            appId: 10008354,
            robotId: '17277dadf11949c5b127ba2716855349',
            uid
        }, {
            headers: {
                "Content-Type": "application/json",
                "signature": enc
            }
        })
            .then((response) => {
            resolve(response.data);
        })
            .catch((error) => {
            reject(error);
        });
    });
}
exports.sendQuestion = sendQuestion;
electron_1.ipcMain.handle("_sendQuestion", (event, text, id) => {
    return sendQuestion(text);
});
module.exports = { sendQuestion };
//# sourceMappingURL=RobotAnswerMainHelper.js.map
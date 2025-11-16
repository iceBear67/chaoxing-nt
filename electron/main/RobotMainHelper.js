"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const AxiosUtil_1 = require("../utils/AxiosUtil");
const CryptoUtil_1 = require("../utils/CryptoUtil");
const UserHelper_1 = require("./UserHelper");
const ROBOT_BASE_URL = "https://robot.chaoxing.com";
const APP_ID = "10008354";
const APP_KEY = "4a1e131bd4f6b1f779efed0134c34ef3";
const SUCCESS_CODE = 0;
const instance = new AxiosUtil_1.AxiosUtil(ROBOT_BASE_URL, 10000, "json");
const initState = {
    conversationKey: "",
    conversationId: "",
    stream: null,
};
let lastEventSource = {
    ...initState
};
function genSign(config) {
    const { uid, appKey, time, robotUid, robotId } = config;
    const result = (0, CryptoUtil_1.md5)(time + robotUid + robotId + uid + appKey);
    return result;
}
let buffer = "";
async function sseChat(event, content, options) {
    const { robotUid, tempMessageId, robotId, to, chatType, replyInfo, from, questionData = {} } = options;
    if (lastEventSource.conversationId) {
        try {
            const res = await stopSseChat(lastEventSource.conversationId);
            if (res.data.statusCode === 0) {
                console.log(`手动结束流式会话成功[msg=${res.data.msg}]`);
                if (lastEventSource.stream) {
                    lastEventSource.stream.destroy();
                    lastEventSource = { ...initState };
                }
            }
            else {
                console.error(`手动结束流式会话出错[statusCode=${res.data.statusCode}][msg=${res.data.msg}]`);
            }
        }
        catch (error) {
            console.error("手动结束流式会话出错:", error?.message);
        }
    }
    const uid = (0, UserHelper_1.getUID)();
    const time = String(Date.now());
    const signature = genSign({
        time,
        uid,
        appKey: APP_KEY,
        robotUid,
        robotId,
    });
    const headers = {
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
        signature: signature,
    };
    const data = {
        question: {
            content,
            ...questionData
        },
        appId: APP_ID,
        uid,
        robotId,
        robotUid,
        timestamp: time,
    };
    if (options.extParams && Object.keys(options.extParams).length > 0) {
        const keys = Object.keys(options.extParams);
        data.extParams = JSON.stringify(keys.map((key) => ({
            name: key,
            value: options.extParams[key],
        })));
    }
    instance
        .post("/v1/api/sse/chat", data, {
        headers,
        responseType: "stream",
        timeout: 0,
    })
        .then(async (res) => {
        const contentType = res.headers["content-type"];
        const isSSE = /^text\/event-stream/i.test(contentType);
        if (isSSE) {
            lastEventSource.conversationKey = to;
            lastEventSource.stream = res.data;
            res.data.on("data", (chunk) => {
                buffer += chunk.toString();
                let boundary = buffer.indexOf("\n\n");
                while (boundary !== -1) {
                    const rawEvent = buffer.slice(0, boundary).trim();
                    buffer = buffer.slice(boundary + 2);
                    const event = parseSSE(rawEvent);
                    if (event) {
                        try {
                            const data = JSON.parse(event.data);
                            let finalData = data;
                            if (data != undefined && data.statusCode === SUCCESS_CODE) {
                                if (data.data !== undefined) {
                                    finalData = data.data;
                                    sendToRenderer("streamData", data.data);
                                }
                                else {
                                    sendToRenderer("streamData", data);
                                }
                            }
                            else {
                                sendToRenderer("streamData", data);
                            }
                            if (finalData.conversationId) {
                                lastEventSource.conversationId = finalData.conversationId;
                            }
                        }
                        catch (e) {
                            console.error("streamError! json:", event.data);
                            sendToRenderer("streamError");
                        }
                    }
                    boundary = buffer.indexOf("\n\n");
                }
            });
            res.data.on("end", () => {
                sendToRenderer("streamEnd");
                lastEventSource = { ...initState };
            });
            res.data.on("error", (error) => {
                sendToRenderer("streamError");
                lastEventSource = { ...initState };
            });
        }
        else {
            let raw = "";
            for await (const chunk of res.data) {
                raw += chunk.toString();
            }
            try {
                const data = JSON.parse(raw);
                sendToRenderer("jsonData", data);
            }
            catch {
                sendToRenderer("jsonError");
            }
        }
    })
        .catch((error) => {
        console.error("SSE Chat Error:", error.message);
        sendToRenderer("httpError");
        lastEventSource = { ...initState };
    });
    function sendToRenderer(type, data, error) {
        event.sender.send("robotMessage", {
            from,
            type,
            data,
            error,
            tempMessageId,
            to,
            chatType,
            replyInfo,
        });
    }
}
function parseSSE(raw) {
    const lines = raw.split("\n");
    let data = "";
    let event = "";
    let id = "";
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data:")) {
            data += trimmed.slice(5).trim() + "\n";
        }
        else if (trimmed.startsWith("event:")) {
            event = trimmed.slice(6).trim();
        }
        else if (trimmed.startsWith("id:")) {
            id = trimmed.slice(3).trim();
        }
    }
    if (data) {
        return {
            event: event || "message",
            data: data.trim(),
            id: id || undefined,
        };
    }
    return null;
}
function stopSseChat(conversationId) {
    const signature = (0, CryptoUtil_1.md5)(`appId=${APP_ID}conversationId=${conversationId}${APP_KEY}`);
    return instance.get(`${ROBOT_BASE_URL}/v1/api-agent/sse/chat/manualEndLlmReply`, {
        headers: {
            signature
        },
        params: {
            conversationId,
            appId: APP_ID,
            signature
        }
    });
}
electron_1.ipcMain.on("_sseChat", sseChat);
//# sourceMappingURL=RobotMainHelper.js.map
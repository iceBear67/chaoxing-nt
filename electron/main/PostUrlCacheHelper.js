"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostUrlCache = exports.initPostUrlCache = exports.pushPostUrlCache = exports.getUploadDatasFromPostBody = exports.PostUrlCache = void 0;
const electron_1 = require("electron");
const WebRequestHelper_1 = require("./WebRequestHelper");
const MAX_CACHE_COUNT = 30;
const DEL_CACHE_COUNT_ONCE = 10;
class PostUrlCache {
}
exports.PostUrlCache = PostUrlCache;
const m_PostUrlCaches = [];
function getUploadDatasFromPostBody(postBody) {
    let uploadDatas = [];
    if (postBody && postBody.data) {
        let postDatas = postBody.data;
        if (postDatas) {
            for (let postData of postDatas) {
                if (postData.bytes) {
                    uploadDatas.push({ bytes: postData.bytes });
                }
            }
        }
    }
    return uploadDatas;
}
exports.getUploadDatasFromPostBody = getUploadDatasFromPostBody;
function pushPostUrlCache(postUrlCacheData) {
    removePostUrlCache(postUrlCacheData.url);
    m_PostUrlCaches.push(postUrlCacheData);
    if (m_PostUrlCaches.length > MAX_CACHE_COUNT) {
        m_PostUrlCaches.splice(0, DEL_CACHE_COUNT_ONCE);
    }
}
exports.pushPostUrlCache = pushPostUrlCache;
function initPostUrlCache() {
    (0, WebRequestHelper_1.addBeforeRequestListener)("postUrlCache", async (details) => {
        if (details.method == "POST" && !details.url.includes("rtm.agora.io")) {
            let postUrlCacheData = new PostUrlCache();
            postUrlCacheData.url = details.url;
            postUrlCacheData.uploadData = details.uploadData;
            electron_1.session.defaultSession.webRequest.onSendHeaders({ urls: [details.url] }, (details) => {
                postUrlCacheData.herders = details.requestHeaders;
                postUrlCacheData.referrer = details.referrer;
                pushPostUrlCache(postUrlCacheData);
            });
        }
        return 0;
    });
}
exports.initPostUrlCache = initPostUrlCache;
function removePostUrlCache(url) {
    for (let i = 0; i < m_PostUrlCaches.length; i++) {
        let postUrlCache = m_PostUrlCaches[i];
        if (postUrlCache.url == url) {
            m_PostUrlCaches.splice(i, 1);
            return;
        }
    }
}
function getPostUrlCache(url) {
    for (let postUrlCache of m_PostUrlCaches) {
        if (postUrlCache.url == url) {
            return postUrlCache;
        }
    }
}
exports.getPostUrlCache = getPostUrlCache;
module.exports = {
    PostUrlCache,
    initPostUrlCache,
    getPostUrlCache,
    pushPostUrlCache,
    getUploadDatasFromPostBody,
};
//# sourceMappingURL=PostUrlCacheHelper.js.map
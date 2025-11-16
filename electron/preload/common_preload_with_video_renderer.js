require("./ketang_common_preload");
const { contextBridge } = require("electron")
console.log("common_preload_with_video_renderer")
let VideoRendererHelper = require("../renderer/agaro/VideoRowDataRendererHelper");
if (VideoRendererHelper) {
    contextBridge.exposeInMainWorld("VideoRendererHelper", VideoRendererHelper)
}


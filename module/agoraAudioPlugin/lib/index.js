const path = require("path");
let m_PluginLibrary;

function init() {
  let nodePath;
  if (process.platform == "darwin") {
    nodePath = path.join(__dirname, "../mac/agoraRawDataPlugin.node");
  } else if (process.platform == "win32") {
    if (process.arch == "x64") {
      nodePath = path.join(__dirname, "../win_x64/agoraRawDataPlugin.node");
    } else {
      nodePath = path.join(__dirname, "../win_ia32/agoraRawDataPlugin.node");
    }
  } else {
    return;
  }
  m_PluginLibrary = require(nodePath);
}

init();

// function setRawDataPluginLogPath(logDir) {
//   //   let logPath = path.join(logDir, "agoraRawData.log");
//   m_PluginLibrary.InitLogPath(logDir);
// }

function enabledRawDataPlugin(argoaSdkEngine) {
  const handle = argoaSdkEngine?.getNativeHandle();
  console.log("enabledRawDataPlugin NativeHandle:", handle);
  if (handle !== undefined) {
    m_PluginLibrary.CreateSampleAudioPlugin(handle);
  }
}

function disableRawDataPlugin() {
  if (m_PluginLibrary) {
    m_PluginLibrary?.DisablePlugin();
    // m_PluginLibrary = undefined;
  } else {
    console.error("pluginAudio is invalid");
  }
}

function loadAudioFrameData() {
  if (m_PluginLibrary) {
    return m_PluginLibrary.LoadAudioFrameData();
  }
}

module.exports = {
  enabledRawDataPlugin,
  disableRawDataPlugin,
  loadAudioFrameData,
};

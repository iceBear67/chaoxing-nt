const fs = require("fs");
const v8 = require("v8");
const path = require("path");
const Module = require("module");

projectPath="."
  function md5(str) {
    const crypto = require("crypto");
    var md5 = crypto.createHash("md5");
    md5.update(str);
    var str2 = md5.digest("hex");
    return str2;
  }


  function md5File(filePath) {
    const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });
    return md5(fileData);
  }

  function md5Preloads(projectPath) {
    let preloadDir = path.join(projectPath, "electron/preload");
    let preloadFiles = fs.readdirSync(preloadDir);
    preloadFiles.sort();
    let preloadMd5 = "";
    for (let preloadFile of preloadFiles) {
      let tempFilePath = path.join(preloadDir, preloadFile);
      if (fs.statSync(tempFilePath).isFile()) {
        let tempPreladMd5 = md5File(tempFilePath);
        preloadMd5 += tempPreladMd5;
      }
    }
    return preloadMd5;
  }
  const pwd = "9L#eXp6@k!m$2%Gv";
  const appConfigJsonPath = path.join(
    projectPath,
    "electron/config/appconfig.json"
  );
  const packageJsonPath = path.join(projectPath, "package.json");
  const indexJsPath = path.join(projectPath, "index.js");
  const cfgFileData = fs.readFileSync(appConfigJsonPath, { encoding: "utf-8" });
  const md5CfgFileData = md5(cfgFileData);
  const packageMain = "hack.js"
  const indexJsData = fs.readFileSync(indexJsPath, { encoding: "utf-8" });
  const md5IndexJsData = md5(indexJsData);
   const jscxFileData = fs.readFileSync(path.join(projectPath, "module/compile/lib/Jscx.js"), { encoding: "utf-8" });
  const md5JscxFileData = md5(jscxFileData);
  const md5PreloadFiles = md5Preloads(projectPath);

  let electronVersion = process.versions.electron;
    let tempIndex = electronVersion.indexOf("-")
  if( tempIndex> -1){
    electronVersion = electronVersion.substring(0, tempIndex);
  }

  const data =
    electronVersion +
    "_" +
    md5CfgFileData +
    "_" +
    packageMain +
    "_" +
    md5IndexJsData +
    "_" +
    md5JscxFileData +
    "_" +
    md5PreloadFiles +
    "_" +
    pwd;
  const retData = md5(data);
  fs.writeFileSync(path.join(projectPath, "electron/config/verify.data"), retData, { encoding: "utf-8" });
console.log(retData)
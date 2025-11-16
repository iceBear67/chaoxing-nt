"use strict";

const fs = require("fs");
const v8 = require("v8");
const path = require("path");
const Module = require("module");

// // 保存原始的 _resolveFilename 方法
// const originalResolveFilename = Module._resolveFilename;

// // 重写 Module._resolveFilename
// Module._resolveFilename = function (request, parent, isMain, options) {
//   try {
//     // 尝试使用原始方法解析模块路径
//     return originalResolveFilename.call(this, request, parent, isMain, options);
//   } catch (error) {
//     // 如果模块未找到，尝试从 app.asar.unpacked 中加载
//     if (error.code === "MODULE_NOT_FOUND") {
//       if (request.includes("app.asar/")) {
//         const unpackedPath = request.replace("app.asar/", "app.asar.unpacked/");
//         return originalResolveFilename.call(
//           this,
//           unpackedPath,
//           parent,
//           isMain,
//           options
//         );
//       }
//     }
//     // 如果仍然找不到，抛出原始错误
//     throw error;
//   }
// };

let compileExt;
if (process.platform == "darwin") {
  compileExt = require("../mac/CompileExt");
} else if (process.platform == "win32") {
  if (process.arch == "x64") {
    compileExt = require("../win_x64/CompileExt");
  } else {
    compileExt = require("../win_ia32/CompileExt");
  }
}

v8.setFlagsFromString("--no-lazy");

const COMPILED_EXTNAME = ".jscx";

Module._extensions[COMPILED_EXTNAME] = function (fileModule, filename) {
  function require(id) {
    return fileModule.require(id);
  }
  require.resolve = function (request, options) {
    return Module._resolveFilename(request, fileModule, false, options);
  };
  require.main = process.isMainFrame;

  require.extensions = Module._extensions;
  require.cache = Module._cache;

  const dirname = path.dirname(filename);
  const proDirPath = path.join(__dirname, "../../../");
  // let fileData = fs.readFileSync(filename, { encoding: "utf-8" });
  // console.log("filename", filename);
  // console.log("fileData", fileData);
  compileExt.RunFile(
    filename,
    dirname,
    fileModule.exports,
    require,
    fileModule,
    process,
    global,
    proDirPath
  );
};

const fs = require("fs");
const v8 = require("v8");
const path = require("path");
const Module = require("module");
const calculate = require("./calculate_verify");
console.log(calculate)
fs.writeFileSync("./electron/config/verify.data", calculate.toString(), { encoding: "utf-8" });

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

let currentDecrypting = ""
let original = require('crypto').createDecipheriv
require('crypto').createDecipheriv = function(method, key, iv) { // to bypass md5 validation
  let decrypter = original(method, key, iv)
  console.log("Decrypting file: ", currentDecrypting);
  console.log("Method: ", method);
  console.log("Key: '"+ key+"'");
  console.log("IV: '"+iv+"'");
  let ogUpdate = decrypter.update
  let currentDecrypted = ""
  decrypter.update = function(...args) {  
    let decrypted = ogUpdate.apply(decrypter, args)
    if(decrypted.includes("verify.data")){
      decrypted =  "(function (require,process,projectPath){ return true;}"
    }
    console.log(args[0].substring(0, Math.min(args[0].length, 256)));
    console.log(decrypted.substring(0, Math.min(decrypted.length, 256)));
        currentDecrypted += decrypted
    return decrypted
  }
  let ogFinal = decrypter.final
  decrypter.final = function(outEnc) {
    let finalDecrypted = ogFinal.call(decrypter, outEnc)
    process.stdout.write(finalDecrypted.substring(finalDecrypted.length - 50))
    currentDecrypted += finalDecrypted
    fs.appendFileSync(currentDecrypting.replace(".jscx", ".dec.js"), currentDecrypted+"\n", { encoding: "utf-8" });
    console.log("Do final")
    return finalDecrypted
  }
  return decrypter;
}

let compileExt = require("./module/compile/win_x64/CompileExt");

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
  console.log("filename", filename);
  fs.unlinkSync(filename.replace(".jscx", ".dec.js"));
  currentDecrypting = filename
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

require("./electron/main/main");

return

const startDir = process.cwd();

function walkSync(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkSync(fullPath);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(COMPILED_EXTNAME)) {
      try {
        console.log(`Loading ${fullPath}...`);
        require(fullPath);
      } catch (err) {
        console.error(`Error loading ${fullPath}:`, err && err.message ? err.message : err);
      }
    }
  }
}

 walkSync(startDir);
return
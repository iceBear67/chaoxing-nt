let processArgs = process.argv;
console.log("processArgs:", process.argv.length);
if (process.platform == "win32" && processArgs.length > 1) {
  let args = processArgs[1];
  if (args == "--uninstallerApp") {
    const { delOldVersionFolders } = require("./electron/UninstApp");
    delOldVersionFolders();
    process.exit(0);
    return;
  }
}

require("./electron/main/main");
// require("./MainHelper")

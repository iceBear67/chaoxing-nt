let compileExt;
if (process.platform == "darwin") {
    compileExt = require('../mac/CompileExt')
} else if (process.platform == "win32") {
    if (process.arch == "x64") {
        compileExt = require('../win_x64/CompileExt')
    } else {
        compileExt = require('../win_ia32/CompileExt')
    }
}


function getDbKey(dbname) {
    return compileExt.GetDbKey(dbname, require);
}

module.exports = { getDbKey }
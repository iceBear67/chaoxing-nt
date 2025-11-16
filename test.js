const crypto = require('crypto');
const fs = require('fs');
let decrypter = crypto.createDecipheriv("aes-128-ecb", "d5b9.4ea*95453e9", '')
let content = fs.readFileSync("./electron/main/main.jscx").toString()
console.log("peek: "+content.substring(0, 64))
decrypter.update(content, "base64", "utf-8")
console.log(decrypter.final("utf-8"))
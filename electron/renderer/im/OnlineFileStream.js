"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveFolderStream = exports.ReceiveFileStream = exports.ReceiveBaseStream = exports.SendFolderStream = exports.SendFileStream = exports.SendBaseStream = void 0;
const stream_1 = require("stream");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function uuidStrToHexBuffer(uuidV4Str) {
    return Buffer.from(uuidV4Str.replace(/-/g, ""), "hex");
}
class FileHeader {
}
class SendBaseStream extends stream_1.Readable {
    constructor() {
        super({ highWaterMark: 100 * 1024 });
        this.onHandleData = false;
    }
}
exports.SendBaseStream = SendBaseStream;
class SendFileStream extends SendBaseStream {
    constructor(localFilePath) {
        super();
        this.m_CurReadLength = 0;
        this.m_LocalFilePath = localFilePath;
        this.m_CurReadLength = 0;
    }
    getReadLength() {
        return this.m_CurReadLength;
    }
    _read(size) {
        if (!this.m_FileReadStream) {
            this.m_FileReadStream = fs_1.default.createReadStream(this.m_LocalFilePath);
            this.m_FileReadStream.on("readable", () => {
                this.m_FileReadStream.read(size);
            });
            this.m_FileReadStream.on("data", (chunk) => {
                this.push(chunk);
                this.m_CurReadLength += chunk.length;
            });
            this.m_FileReadStream.on("end", () => {
                this.push(null);
            });
        }
        else {
            this.m_FileReadStream.read(size);
        }
    }
}
exports.SendFileStream = SendFileStream;
class SendFolderStream extends SendBaseStream {
    constructor(onlineFile) {
        super();
        this.m_AllSubFiles = [];
        this.m_AllSubFilesBuffer = Buffer.alloc(0);
        this.m_AllOnlySubFiles = [];
        this.m_ReadHeaderLength = 0;
        this.m_CurFileIndex = 0;
        this.m_IsReadHeader = false;
        this.m_CurReadLength = 0;
        this.m_BasePath = onlineFile.localFilePath;
        this.handleSubFiles(onlineFile);
        let startPos = 0;
        for (let i = 0; i < this.m_AllSubFiles.length; i++) {
            let fileHeader = this.m_AllSubFiles[i];
            if (!fileHeader.isFolder) {
                fileHeader.startPos = startPos;
                startPos += fileHeader.fileSize + 16;
                fileHeader.endPos = startPos;
                this.m_AllOnlySubFiles.push(fileHeader);
            }
        }
        let headerBuffer = Buffer.from(JSON.stringify(this.m_AllSubFiles));
        const lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32BE(headerBuffer.length, 0);
        this.m_AllSubFilesBuffer = Buffer.concat([lengthBuffer, headerBuffer]);
    }
    handleSubFiles(onlineFile, parentRelativePath = "") {
        if (onlineFile.isFolder) {
            for (let subFile of onlineFile.subFiles) {
                let fileHeader = new FileHeader();
                fileHeader.fileId = subFile.id;
                fileHeader.fileName = subFile.name;
                fileHeader.fileSize = subFile.size;
                fileHeader.isFolder = subFile.isFolder;
                fileHeader.relativePath = parentRelativePath + "/" + subFile.name;
                this.m_AllSubFiles.push(fileHeader);
                if (subFile.isFolder) {
                    this.handleSubFiles(subFile, fileHeader.relativePath);
                }
            }
        }
    }
    _read(size) {
        console.debug("SendFolderStream _read:", size);
        if (this.m_CurFileIndex >= this.m_AllOnlySubFiles.length) {
            this.push(null);
            return;
        }
        if (!this.m_IsReadHeader) {
            if (this.m_ReadHeaderLength + size >= this.m_AllSubFilesBuffer.length) {
                let tempHeaderBuffer = this.m_AllSubFilesBuffer.subarray(this.m_ReadHeaderLength, this.m_AllSubFilesBuffer.length);
                this.push(tempHeaderBuffer);
                this.m_IsReadHeader = true;
                this.m_ReadHeaderLength = this.m_AllSubFilesBuffer.length;
            }
            else {
                let tempHeaderBuffer = this.m_AllSubFilesBuffer.subarray(this.m_ReadHeaderLength, this.m_ReadHeaderLength + size);
                this.push(tempHeaderBuffer);
                this.m_ReadHeaderLength += size;
            }
        }
        else {
            let curHeader = this.m_AllOnlySubFiles[this.m_CurFileIndex];
            if (!this.m_FileReadStream) {
                this.m_FileReadStream = fs_1.default.createReadStream(path_1.default.join(this.m_BasePath, curHeader.relativePath), { highWaterMark: 100 * 1024 });
                let fileIdBuffer = uuidStrToHexBuffer(curHeader.fileId);
                this.push(fileIdBuffer);
                this.m_FileReadStream.on("data", (chunk) => {
                    console.debug("m_FileReadStream file data:", chunk.length);
                    this.push(chunk);
                    this.m_CurReadLength += chunk.length;
                    this.m_FileReadStream.pause();
                });
                this.m_FileReadStream.on("end", () => {
                    console.debug("m_FileReadStream file end");
                    this.m_FileReadStream = null;
                    this.m_CurFileIndex++;
                    console.debug("m_FileReadStream file end:this.m_CurFileIndex :", this.m_CurFileIndex);
                    console.debug("m_FileReadStream file end:this.m_AllSubFiles.length :", this.m_AllSubFiles.length);
                    if (this.m_CurFileIndex >= this.m_AllSubFiles.length) {
                        this.push(null);
                    }
                    else {
                        this._read(size);
                    }
                });
            }
            else {
                this.m_FileReadStream.resume();
            }
        }
    }
    getReadLength() {
        return this.m_CurReadLength;
    }
}
exports.SendFolderStream = SendFolderStream;
class ReceiveBaseStream extends stream_1.Writable {
    constructor() {
        super({ highWaterMark: 100 * 1024 });
    }
}
exports.ReceiveBaseStream = ReceiveBaseStream;
class ReceiveFileStream extends ReceiveBaseStream {
    constructor(localFilePath, fileSize) {
        super();
        this.m_CurWriteLength = 0;
        this.m_FileSize = 0;
        this.m_FileSize = fileSize;
        let baseDir = path_1.default.dirname(localFilePath);
        if (!fs_1.default.existsSync(baseDir)) {
            fs_1.default.mkdirSync(baseDir, { recursive: true });
        }
        this.m_FileWriteStream = fs_1.default.createWriteStream(localFilePath);
        this.m_FileWriteStream.on("close", () => {
            this.m_FileWriteStream.end();
        });
        this.m_FileWriteStream.on("finish", () => {
            this.m_FileWriteStream.end();
        });
        this.m_FileWriteStream.on("error", () => {
            this.m_FileWriteStream.end();
        });
    }
    _write(chunk, encoding, callback) {
        this.m_FileWriteStream.write(chunk, encoding, callback);
        this.m_CurWriteLength += chunk.length;
        if (this.m_CurWriteLength >= this.m_FileSize) {
            this.m_FileWriteStream.end();
        }
    }
    getWriteLength() {
        return this.m_CurWriteLength;
    }
}
exports.ReceiveFileStream = ReceiveFileStream;
class ReceiveFolderStream extends ReceiveBaseStream {
    constructor(localFilePath) {
        super();
        this.m_CurWriteLength = 0;
        this.m_CurFileWriteLength = 0;
        this.m_CurHeadSize = 0;
        this.m_CurFileIndex = 0;
        this.m_AllSubFiles = [];
        this.m_AllSubFilesBuffer = Buffer.alloc(0);
        this.m_AllOnlySubFiles = [];
        this.m_TempChunk = Buffer.alloc(0);
        this.m_BaseLocalFilePath = localFilePath;
        if (!fs_1.default.existsSync(localFilePath)) {
            fs_1.default.mkdirSync(localFilePath, { recursive: true });
        }
    }
    _write(chunk, encoding, callback) {
        console.debug("ReceiveFolderStream _write,chunk:", chunk);
        this.m_TempChunk = Buffer.concat([this.m_TempChunk, chunk]);
        try {
            this.handleData().then((result) => {
                if (result) {
                    callback();
                }
                else {
                    callback(new Error(`写数据失败`));
                }
            });
        }
        catch (err) {
            callback(err);
        }
    }
    async handleData() {
        if (this.m_TempChunk.length == 0) {
            return true;
        }
        if (this.m_AllSubFiles.length == 0) {
            if (this.m_CurHeadSize == 0) {
                const bigEndianValue = this.m_TempChunk.readInt32BE(0);
                this.m_CurHeadSize = bigEndianValue;
                this.m_TempChunk = this.m_TempChunk.subarray(4);
            }
            if (this.m_CurHeadSize > this.m_TempChunk.length) {
                return true;
            }
            let headerBuffer = this.m_TempChunk.subarray(0, this.m_CurHeadSize);
            this.m_TempChunk = this.m_TempChunk.subarray(this.m_CurHeadSize);
            this.m_AllSubFiles = JSON.parse(headerBuffer.toString());
            console.debug("ReceiveFolderStream,fileHeader:", this.m_AllSubFiles);
            for (let fileHeader of this.m_AllSubFiles) {
                if (!fileHeader.isFolder) {
                    this.m_AllOnlySubFiles.push(fileHeader);
                }
                else {
                    let folderPath = path_1.default.join(this.m_BaseLocalFilePath, fileHeader.relativePath);
                    if (!fs_1.default.existsSync(folderPath)) {
                        fs_1.default.mkdirSync(folderPath, { recursive: true });
                    }
                }
            }
        }
        if (this.m_CurFileIndex >= this.m_AllOnlySubFiles.length) {
            return true;
        }
        if (this.m_TempChunk.length == 0) {
            return true;
        }
        let curFileHeader = this.m_AllOnlySubFiles[this.m_CurFileIndex];
        await this.writeCurFile(curFileHeader);
        return true;
    }
    async writeCurFile(curFileHeader) {
        if (!this.m_FileWriteStream) {
            this.m_CurFileWriteLength = 0;
            if (this.m_TempChunk.length < 16) {
                return true;
            }
            let fileIdBuffer = this.m_TempChunk.subarray(0, 16);
            let fileIdBuffer2 = uuidStrToHexBuffer(curFileHeader.fileId);
            if (!fileIdBuffer.equals(fileIdBuffer2)) {
                let lastFilePath = "";
                if (this.m_CurFileIndex > 0) {
                    let lastFile = this.m_AllOnlySubFiles[this.m_CurFileIndex - 1];
                    lastFilePath = path_1.default.join(lastFile.relativePath, lastFile.fileName);
                }
                console.error(`文件接收校验失败:文件：${lastFilePath}`);
                throw new Error(`文件接收校验失败:文件：${lastFilePath}`);
            }
            this.m_TempChunk = this.m_TempChunk.subarray(16);
            let localFilePath = path_1.default.join(this.m_BaseLocalFilePath, curFileHeader.relativePath);
            if (curFileHeader.fileSize == 0) {
                fs_1.default.writeFileSync(localFilePath, "");
                this.m_CurFileIndex++;
                await this.handleData();
                return true;
            }
            this.m_FileWriteStream = fs_1.default.createWriteStream(localFilePath);
        }
        if (this.m_TempChunk.length == 0) {
            return true;
        }
        if (this.m_CurFileWriteLength + this.m_TempChunk.length >=
            curFileHeader.fileSize) {
            let size = curFileHeader.fileSize - this.m_CurFileWriteLength;
            await this.writeFileData(this.m_FileWriteStream, this.m_TempChunk.subarray(0, size));
            this.m_CurFileWriteLength += size;
            this.m_CurWriteLength += size;
            this.m_TempChunk = this.m_TempChunk.subarray(size);
            this.m_FileWriteStream.end();
            this.m_FileWriteStream.close();
            this.m_CurFileIndex++;
            this.m_FileWriteStream = null;
            return this.handleData();
        }
        else {
            await this.writeFileData(this.m_FileWriteStream, this.m_TempChunk);
            this.m_CurFileWriteLength += this.m_TempChunk.length;
            this.m_CurWriteLength += this.m_TempChunk.length;
            this.m_TempChunk = Buffer.alloc(0);
        }
        return true;
    }
    async writeFileData(writeStream, chunck) {
        return new Promise((resolve, reject) => {
            writeStream.write(chunck, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    getWriteLength() {
        return this.m_CurWriteLength;
    }
}
exports.ReceiveFolderStream = ReceiveFolderStream;
//# sourceMappingURL=OnlineFileStream.js.map
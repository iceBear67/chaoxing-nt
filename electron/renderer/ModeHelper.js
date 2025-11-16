"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMode = void 0;
function useMode(mode) {
    if (mode == "dataMigration") {
        require("./DataMigrationHelper");
    }
    else if (mode == "contactsDb") {
        require("./ContactsDbHelper");
    }
    else if (mode == "noticeDb") {
        require("./NoticeDbHelper");
    }
    else if (mode == "storage") {
        require("./StorageHelper");
    }
    else if (mode == "browserTab") {
        require("./BrowserTabHelper");
    }
    else if (mode == "HIDBlack") {
        require("./HIDBlackHelper");
    }
    else if (mode == "AiAsr") {
        require("./ai/asr/AiAsrHelper");
    }
    else if (mode == "ProjectionBox") {
        require("../module/projection/renderer/ProjectionBoxHelper");
    }
    else if (mode == "ImMessage") {
        return require("./im/ImHelper");
    }
    else if (mode == "AVCall") {
        return require("./im/AudioVideoCallHelper");
    }
    else if (mode == "OnlineFile") {
        return require("./im/OnlineFileHelper");
    }
}
exports.useMode = useMode;
//# sourceMappingURL=ModeHelper.js.map
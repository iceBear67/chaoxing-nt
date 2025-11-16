"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const path_1 = __importDefault(require("path"));
const translationPath = path_1.default.join(__dirname, 'languages');
i18next_1.default
    .use(i18next_fs_backend_1.default)
    .init({
    lng: 'en-US',
    fallbackLng: 'en-US',
    ns: ['translation'],
    defaultNS: 'translation',
    keySeparator: '.',
    interpolation: {
        escapeValue: false,
    },
    backend: {
        loadPath: path_1.default.join(translationPath, '{{lng}}.json'),
    },
});
exports.default = i18next_1.default;
//# sourceMappingURL=i18n.js.map
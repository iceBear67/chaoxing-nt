"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertParamsToUploadData = void 0;
function convertParamsToUploadData(data) {
    if (!data || data.length === 0)
        return undefined;
    const formParams = new URLSearchParams();
    const keys = Object.keys(data);
    for (const key of keys) {
        const value = data[key];
        const valueAsString = typeof value === "object" ? JSON.stringify(value) : String(value);
        formParams.append(key, valueAsString);
    }
    return [{ type: "rawData", bytes: Buffer.from(formParams.toString()) }];
}
exports.convertParamsToUploadData = convertParamsToUploadData;
//# sourceMappingURL=PostDataUtils.js.map
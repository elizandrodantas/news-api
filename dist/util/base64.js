"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUtf8 = exports.toBase64 = void 0;
function toBase64(string) {
    return Buffer.from(string).toString("base64");
}
exports.toBase64 = toBase64;
function toUtf8(string) {
    return Buffer.from(string, "base64").toString("utf-8");
}
exports.toUtf8 = toUtf8;

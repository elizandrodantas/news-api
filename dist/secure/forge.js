"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeSecure = void 0;
const node_forge_1 = __importDefault(require("node-forge"));
function forgeSecure() {
    return {
        iv: generateIv,
        encrypt,
        decrypt,
        encode64,
        decode64
    };
}
exports.forgeSecure = forgeSecure;
function generateIv() {
    let g = node_forge_1.default.random.getBytes(16);
    let e = encode64(String(g));
    return e;
}
function encrypt(e, t, r) {
    if (!e || !t || !r)
        return "";
    try {
        r = decode64(r);
        let n = node_forge_1.default.cipher.createCipher('AES-CBC', t);
        n.start({ iv: r });
        n.update(node_forge_1.default.util.createBuffer(e));
        n.finish();
        return node_forge_1.default.util.encode64(n.output.getBytes());
    }
    catch (_) {
        return "";
    }
}
function decrypt(e, t, r) {
    if (!e || !t || !r)
        return "";
    try {
        e = decode64(e);
        r = decode64(r);
        let n = node_forge_1.default.cipher.createDecipher("AES-CBC", t);
        n.start({ iv: r });
        n.update(node_forge_1.default.util.createBuffer(e));
        n.finish();
        return n.output.toString();
    }
    catch (_) {
        return "";
    }
}
function decode64(string) {
    return node_forge_1.default.util.decode64(string);
}
function encode64(string) {
    return node_forge_1.default.util.encode64(string);
}

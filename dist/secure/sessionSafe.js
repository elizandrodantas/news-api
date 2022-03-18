"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSecure = void 0;
const forge_1 = require("./forge");
class SessionSecure {
    constructor(sub) {
        this.sub = sub;
    }
    verify() {
        if (!this.sub)
            return false;
        return true;
    }
    decode() {
        if (!this.verify())
            return new Error("session signature invalid");
        let d = this.decodeSub(this.sub);
        if (!d || d instanceof Error)
            return new Error("session signature invalid");
        this.decoded = d;
        return this;
    }
    getDecoded() { return this.decoded; }
    verifyRelative(relative) {
        if (!relative || !this.decoded)
            return false;
        if (relative !== this.decoded)
            return false;
        return true;
    }
    decodeSub(sub) {
        let c = forge_1.forgeSecure, d = c().decode64(sub), [iv, key] = d.split(':');
        if (!iv || !key)
            return new Error("session invalid");
        return c().decrypt(key, process.env.KEY_FORGE, iv);
    }
}
exports.SessionSecure = SessionSecure;

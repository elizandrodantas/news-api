"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonWebToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const uuid_1 = require("uuid");
const ms_1 = __importDefault(require("ms"));
const forge_1 = require("../secure/forge");
const sessionUpdate_1 = require("../secure/sessionUpdate");
const prisma_1 = require("../database/prisma");
class JsonWebToken {
    constructor(sub = "") {
        this.key = process.env.KEY_JWT;
    }
    async sign({ username, userIdentify, roles }) {
        if (!username || !userIdentify)
            return new Error("parameteres invalid");
        let sessionId = (0, uuid_1.v4)(), sub = this.createSub(sessionId), aud = (0, uuid_1.v4)();
        let scope = this.createScope(roles);
        let response = {
            token: (0, jsonwebtoken_1.sign)({
                username,
                sub,
                jti: sessionId,
                iss: process.env.JWT_ISS || "W(+)",
                client_id: userIdentify,
                scope,
            }, this.key, {
                expiresIn: process.env.EXP_JWT || "10m"
            }),
            refresh: (0, jsonwebtoken_1.sign)({
                username,
                sub,
                jti: sessionId,
                iss: process.env.JWT_ISS || "W(+)",
                aud,
                client_id: userIdentify,
                scope: [...scope, "refresh:" + aud + ":token"]
            }, this.key, {
                expiresIn: "1d"
            }),
            expire: (0, ms_1.default)(process.env.EXP_JWT || "10m"),
            client_id: userIdentify,
            token_type: "Bearer",
            scope,
            jti: sessionId
        };
        let updateSession = await (0, sessionUpdate_1.sessionIdUpdate)(sessionId, userIdentify);
        if (updateSession instanceof Error)
            return new Error(updateSession.message);
        return Object.assign({}, updateSession, response);
    }
    async verify({ bearer, type = "token", }) {
        if (!bearer)
            return new Error("token not found or invalid");
        let [, token] = bearer.split(' ');
        if (!token || token.indexOf("eyJ") !== 0)
            return new Error("session invalid");
        let verifyToken = await (0, jsonwebtoken_1.verify)(token, this.key, async (err, dec) => {
            if (err)
                return new Error("session expired");
            return dec;
        });
        if (verifyToken instanceof Error)
            return new Error(verifyToken.message);
        let { sub, jti, scope, aud } = verifyToken;
        if (type === "refresh") {
            if (!scope || typeof scope !== "object" || !aud)
                return new Error("refresh token invalid");
            let err = true;
            for (let i of scope) {
                if (i) {
                    let [o, a, t] = i.split(':');
                    if (o === "refresh" && t === "token" && aud === a)
                        err = false;
                }
            }
            if (err)
                return new Error("scope refresh invalid");
        }
        if (aud && type === "token")
            return new Error("token format invalid");
        let decSub = this.decodeSub(sub);
        if (decSub instanceof Error)
            return new Error(decSub.message);
        if (decSub !== jti)
            return new Error("session invalid, again login");
        return verifyToken;
    }
    async sessionVerify(userId, sessionId) {
        if (!userId || !sessionId)
            return new Error("session expired");
        let user = await prisma_1.Prisma.user.findFirst({
            where: {
                id: userId,
                sessionId
            }
        });
        if (!user)
            return new Error("session expired");
        return user;
    }
    decode({ bearer }) {
        if (!bearer)
            return new Error("token not found");
        let [, token] = bearer.split(' ');
        if (!token || token.indexOf("eyJ") !== 0)
            return new Error("token invalid");
        return (0, jsonwebtoken_1.decode)(token, { json: true });
    }
    createSub(string) {
        let c = forge_1.forgeSecure, iv = c().iv(), encode = c().encrypt(string, process.env.KEY_FORGE, iv);
        return c().encode64(`${iv}:${encode}`);
    }
    decodeSub(sub) {
        if (!sub)
            return new Error("session invalid");
        let c = forge_1.forgeSecure, d = c().decode64(sub), s = d.split(':'), v;
        if (!s[0] || !s[1])
            return new Error("session invalid");
        return c().decrypt(s[1], process.env.KEY_FORGE, s[0]);
    }
    createScope(roles) {
        let response = [];
        for (let i of roles) {
            response.push(i.scope);
        }
        return response;
    }
}
exports.JsonWebToken = JsonWebToken;

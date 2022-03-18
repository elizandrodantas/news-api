"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignIn = void 0;
const bcrypt_1 = require("bcrypt");
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../database/prisma");
const JsonWebToken_1 = require("../jobs/JsonWebToken");
class SignIn {
    async init(request, response) {
        return {};
    }
    async execute({ username, password }) {
        if (!username
            || !password
            || username.length < 3
            || password.length < 6)
            return new Error("username or password invalid");
        let userVerify = await prisma_1.Prisma.user.findFirst({
            where: {
                username
            },
            include: {
                roles: true
            }
        });
        if (!userVerify)
            return new Error("username or password invalid");
        let { password: encoded, id: userIdentify, active, mailConfirmated, roles, lastActive } = userVerify;
        if (!active)
            return new Error("account desabled");
        if (Math.floor((0, moment_1.default)().diff(moment_1.default.unix(lastActive)) / 1000) <= 10)
            return new Error("user already logged in, try again a few minutes");
        if (!mailConfirmated)
            return { error: true, sreen: "mail", id: userIdentify };
        if (!this.comparePassword(password, encoded))
            return new Error("username or password invalid");
        let sign = await new JsonWebToken_1.JsonWebToken().sign({ username, userIdentify, roles });
        return sign;
    }
    async refreshToken(bearer) {
        if (!bearer)
            return new Error("unauthorization");
        let verify = await new JsonWebToken_1.JsonWebToken().verify({ bearer, type: "refresh" });
        if (verify instanceof Error)
            return new Error(verify.message);
        let { client_id: id, jti } = verify;
        let userData = await prisma_1.Prisma.user.findUnique({
            where: { id },
            include: { roles: true }
        });
        if (!userData)
            return new Error("session invalid, auth again");
        let { sessionId, active, mailConfirmated, roles, username } = userData;
        if (sessionId !== jti)
            return new Error("session expired or invalid");
        if (!active)
            return new Error("account desabled");
        if (!mailConfirmated)
            return new Error("confirm your email to access your account");
        let sign = new JsonWebToken_1.JsonWebToken().sign({ username, userIdentify: id, roles });
        if (sign instanceof Error)
            return new Error("error internal");
        return sign;
    }
    comparePassword(pass, encoded) {
        return (0, bcrypt_1.compareSync)(pass, encoded);
    }
    useSingPem(request) {
        let { body, headers } = request, device_name = headers["x-device-name"], device_id = headers["x-device-id"], { authorization } = headers;
        if (!body || !authorization)
            return new Error("The given client credentials were not valid").status = 401;
        if (!device_name || !device_id)
            return new Error("device invalid").status = 488;
    }
}
exports.SignIn = SignIn;

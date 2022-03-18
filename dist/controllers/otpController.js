"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otp_util = exports.OTP = void 0;
const otplib_1 = require("otplib");
const crypto_1 = require("crypto");
const node_forge_1 = require("node-forge");
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../database/prisma");
class OTP {
    constructor(userId, type, vCode, vkey) {
        this.userId = userId;
        this.vCode = vCode;
        this.vkey = vkey;
        this.typeExp = "m";
        this.type = type;
    }
    generateOtp() {
        try {
            this.secret = node_forge_1.random.getBytesSync(16);
            this.secret = node_forge_1.util.encode64(this.secret);
            this.secret = this.createSha256(this.secret);
            this.counter = Math.floor(Math.random() * 100);
            this.code = otplib_1.hotp.generate(this.secret, this.counter);
            this.secret = node_forge_1.util.encode64(`${this.secret}:${this.counter}`);
            return this;
        }
        catch (_) {
            return new Error("error generate code");
        }
    }
    verifyOtp() {
        try {
            if (!this.vkey || !this.vCode)
                return new Error("code and key not defined");
            let [secret, counter] = node_forge_1.util.decode64(this.vkey).split(":");
            if (!secret || !counter)
                return new Error("invalid code, try again");
            this.secret = secret;
            this.vkey = secret;
            this.code = this.vCode;
            this.counter = Number(counter);
            let verify = otplib_1.hotp.verify({ token: this.code, secret: this.secret, counter: Number(counter) });
            if (!verify)
                return new Error("invalid code, try again");
            return this;
        }
        catch (_) {
            return new Error("code verify invalid");
        }
    }
    getCode() { return this.code; }
    async save() {
        if (!this.code || !this.secret || !this.type || !this.userId)
            return new Error("code or secret not generate");
        if (!this.expire)
            this.expire = 20;
        if (!this.typeExp)
            this.typeExp = "m";
        let create = await prisma_1.Prisma.otp.create({ data: {
                type: this.type,
                code: this.code,
                secret: this.secret,
                expireIn: this.generateExp(this.expire, this.typeExp),
                userId: this.userId
            } }).catch(e => e);
        if (!create)
            return new Error("error create otp");
        let { id } = create;
        this.taskId = id;
        return this;
    }
    async updateWorkAgreged(taskId, workId) {
        if (taskId && workId) {
            await prisma_1.Prisma.otp.update({
                where: { id: taskId },
                data: {
                    workId
                }
            });
        }
        return this;
    }
    async abortService(taskId) {
        if (taskId) {
            await prisma_1.Prisma.otp.delete({
                where: { id: taskId }
            });
        }
    }
    createSha256(key) {
        return (0, crypto_1.createHash)("sha256").update(key).digest("hex");
    }
    generateExp(time = 1, short = "m") {
        return (0, moment_1.default)().add(time, short).unix();
    }
}
exports.OTP = OTP;
class otp_util {
    constructor() {
        this.array = [];
    }
    getOtpArray(array) {
        return this.array = array, this;
    }
    code() {
        try {
            let res = [];
            this.array.map(e => {
                res.push(e.code);
            });
            return res;
        }
        catch (_) {
            return [""];
        }
    }
}
exports.otp_util = otp_util;

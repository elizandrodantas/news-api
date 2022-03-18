"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Confirmations = void 0;
const moment_1 = __importDefault(require("moment"));
const otpController_1 = require("../controllers/otpController");
const prisma_1 = require("../database/prisma");
class Confirmations extends otpController_1.otp_util {
    async mail(id, code) {
        if (!id || !code)
            return new Error("user or code invalid");
        let user = await prisma_1.Prisma.otp.findFirst({
            where: {
                code,
                userId: id,
                expireIn: {
                    gte: (0, moment_1.default)().unix()
                },
                type: "mail",
                using: false
            }
        });
        if (!user)
            return new Error("code invalid or expired");
        return this.updateStatus(id, user.id, "mail"), { status: true, confirmed: (0, moment_1.default)() };
    }
    async cell(id, code) {
        if (!id || !code)
            return new Error("user or code invalid");
        let user = await prisma_1.Prisma.otp.findFirst({
            where: {
                code,
                userId: id,
                expireIn: {
                    gte: (0, moment_1.default)().unix()
                },
                type: "sms",
                using: false
            }
        });
        if (!user)
            return new Error("code invalid or expired");
        return this.updateStatus(id, user.id, "cell"), { status: true, confirmed: (0, moment_1.default)() };
    }
    async updateStatus(userId, otpId, type) {
        try {
            await prisma_1.Prisma.otp.update({
                where: {
                    id: otpId
                },
                data: {
                    using: true,
                    expireIn: 0
                }
            });
            if (type) {
                let data;
                if (type === "mail")
                    data = { mailConfirmated: true };
                if (type === "cell")
                    data = { cellConfirmated: true };
                await prisma_1.Prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: data
                });
            }
        }
        catch (_) { }
    }
}
exports.Confirmations = Confirmations;

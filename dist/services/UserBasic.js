"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBasic = void 0;
const prisma_1 = require("../database/prisma");
const mask_1 = require("../util/mask");
const admin_1 = __importDefault(require("../util/admin"));
const moment_1 = __importDefault(require("moment"));
class UserBasic {
    async getUserByUsername(username) {
        if (!username)
            return new Error("username not found");
        let user = await prisma_1.Prisma.user.findFirst({
            where: {
                username,
                active: true
            },
            include: {
                roles: true
            }
        });
        if (!user)
            return new Error("user not exist");
        if ((0, admin_1.default)(user.roles))
            return new Error("user not exist");
        user.email = (0, mask_1.hideMaskMail)(user.email);
        user.cellphone = (0, mask_1.hideMaskHalf)(user.cellphone);
        user.roles = undefined;
        user.password = undefined;
        user.updatedAt = undefined;
        user.sessionId = undefined;
        user.active = undefined;
        user.secretId = undefined;
        user.clientId = undefined;
        return user;
    }
    async getUserById(id) {
        if (!id)
            return new Error("id not found");
        let user = await prisma_1.Prisma.user.findFirst({
            where: {
                id,
                active: true,
                mailConfirmated: true
            }
        });
        if (!user)
            return new Error("user not exist");
        user.password = undefined;
        user.updatedAt = undefined;
        return user;
    }
    async getUserByIdAndSession(id, sessionId) {
        if (!id || !sessionId)
            return new Error("id or session not found");
        let user = await prisma_1.Prisma.user.findFirst({
            where: {
                id,
                sessionId,
                active: true,
                mailConfirmated: true
            }
        });
        if (!user)
            return new Error("user not exist");
        user.password = undefined;
        user.updatedAt = undefined;
        return user;
    }
    async userInfo(id, jti) {
        if (!id || !jti)
            return new Error("unauthorized");
        let user = await this.getUserByIdAndSession(id, jti);
        if (user instanceof Error)
            return new Error(user.message);
        return user;
    }
    async lastActive(id, jti) {
        if (!id)
            return new Error("unauthorized");
        let verifyUserCondition = await prisma_1.Prisma.user.findFirst({
            where: {
                id,
                active: true,
                mailConfirmated: true
            }
        });
        if (!verifyUserCondition)
            return new Error("unauthorized");
        let { sessionId } = verifyUserCondition;
        if (sessionId !== jti)
            return new Error("session invalid, try again sign-in");
        Promise.resolve(this.updateLastActiveJob(id));
        return {
            active: true,
            lastActive: (0, moment_1.default)().unix(),
            sessionId: jti
        };
    }
    async updateLastActiveJob(id) {
        if (id) {
            await prisma_1.Prisma.user.update({
                where: {
                    id
                },
                data: {
                    lastActive: (0, moment_1.default)().unix()
                }
            });
        }
    }
}
exports.UserBasic = UserBasic;

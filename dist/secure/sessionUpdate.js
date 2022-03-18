"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionIdUpdate = void 0;
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../database/prisma");
async function sessionIdUpdate(session, userId) {
    if (!session || !userId)
        return new Error("error internal");
    let update = await prisma_1.Prisma.user.update({
        where: {
            id: userId
        },
        data: {
            sessionId: session,
            lastActive: (0, moment_1.default)().unix()
        }
    });
    if (!update)
        return new Error("error internal");
    update.password = undefined;
    update.updatedAt = undefined;
    update.id = undefined;
    return update;
}
exports.sessionIdUpdate = sessionIdUpdate;

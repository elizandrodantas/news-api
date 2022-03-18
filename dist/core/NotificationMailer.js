"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreNotificationMailer = void 0;
const prisma_1 = require("../database/prisma");
const sendMailer_1 = require("../jobs/sendMailer");
const uuid_1 = require("uuid");
class CoreNotificationMailer {
    async addedPermission(mail, permissionName) {
        if (!mail)
            return new Error("mail not defined");
        let getData = await prisma_1.Prisma.user.findFirst({
            where: {
                email: mail
            }
        });
        if (!getData)
            return new Error("mail not reference user");
        let { name } = getData;
        return { status: true, taskId: (0, uuid_1.v4)() };
        new sendMailer_1.sendMailer(mail, name)
            .setBody(`<b>Hello ${name}, new permission added the account: <br> <h3>Permission Name: ${permissionName}<h3></b>`)
            .setPayload("Permission added the account!", "New Permission!")
            .processSend()
            .getSendId();
    }
    async removePermission(mail, permissionName) {
        if (!mail)
            return new Error("mail not defined");
        let getData = await prisma_1.Prisma.user.findFirst({
            where: {
                email: mail
            }
        });
        if (!getData)
            return new Error("mail not reference user");
        let { name } = getData;
        return { status: true, taskId: (0, uuid_1.v4)() };
        new sendMailer_1.sendMailer(mail, name)
            .setBody(`<b>Hello ${name}, permission removed the account: <br> <h3>Permission Name: ${permissionName}<h3></b>`)
            .setPayload("Permission removed the account!", "Removed Permission!")
            .processSend()
            .getSendId();
    }
}
exports.CoreNotificationMailer = CoreNotificationMailer;

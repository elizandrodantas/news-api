"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlList = void 0;
const moment_1 = __importDefault(require("moment"));
const NotificationMailer_1 = require("../core/NotificationMailer");
const prisma_1 = require("../database/prisma");
class AccessControlList {
    async addPermissionUser(userId, permissionId) {
        if (!userId || !permissionId)
            return new Error("parameteres invalid");
        let verifyUserExist = await prisma_1.Prisma.user.findUnique({ where: { id: userId } });
        if (!verifyUserExist)
            return new Error("user not exist");
        let verifyPermissionExist = await prisma_1.Prisma.permission.findUnique({ where: { id: permissionId } });
        if (!verifyPermissionExist)
            return new Error("permission not exist");
        let checkAlreadyPermissionExist = await prisma_1.Prisma.permissionRoles.findFirst({
            where: {
                permissionId,
                userId
            }
        });
        if (checkAlreadyPermissionExist)
            return new Error("permission already granted to the user");
        let { name } = verifyPermissionExist;
        let { email } = verifyUserExist;
        let create = await prisma_1.Prisma.permissionRoles.create({
            data: {
                permissionId,
                userId,
                scope: `${name}:${permissionId}:secure`
            }
        });
        if (!create)
            return new Error("error adding user permission");
        new NotificationMailer_1.CoreNotificationMailer().addedPermission(email, name);
        return create;
    }
    async removePermissionUser(userId, permissionId) {
        if (!userId || !permissionId)
            return new Error("parameteres invalid");
        let verifyUserExist = await prisma_1.Prisma.user.findUnique({ where: { id: userId } });
        if (!verifyUserExist)
            return new Error("user not exist");
        let verifyPermissionExist = await prisma_1.Prisma.permission.findUnique({ where: { id: permissionId } });
        if (!verifyPermissionExist)
            return new Error("permission not exist");
        let checkAlreadyPermissionExist = await prisma_1.Prisma.permissionRoles.findFirst({
            where: {
                permissionId,
                userId
            }
        });
        if (!checkAlreadyPermissionExist)
            return new Error("user without permission granted");
        let { name } = verifyPermissionExist;
        let { email, username } = verifyUserExist;
        let create = await prisma_1.Prisma.permissionRoles.deleteMany({
            where: {
                permissionId,
                userId
            }
        });
        if (!create)
            return new Error("error remove permission the user");
        new NotificationMailer_1.CoreNotificationMailer().removePermission(email, name);
        return { status: true, removed: (0, moment_1.default)().toISOString(), data: {
                username,
                permissionName: name
            } };
    }
    async list(userId) {
        if (!userId)
            return new Error("user id not defined");
        let get = await prisma_1.Prisma.permissionRoles.findMany({
            where: {
                userId
            },
            include: {
                permissionRelation: true
            }
        });
        if (!get)
            return new Error("error listing permission user");
        return get;
    }
}
exports.AccessControlList = AccessControlList;

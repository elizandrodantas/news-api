import moment from "moment";
import { CoreNotificationMailer } from "../core/NotificationMailer";
import { Prisma } from "../database/prisma";

export class AccessControlList {
    async addPermissionUser(userId: string, permissionId: string){
        if(!userId || !permissionId) return new Error("parameteres invalid");

        let verifyUserExist = await Prisma.user.findUnique({where: {id: userId}});
        if(!verifyUserExist) return new Error("user not exist");

        let verifyPermissionExist = await Prisma.permission.findUnique({where: {id: permissionId}});
        if(!verifyPermissionExist) return new Error("permission not exist");

        let checkAlreadyPermissionExist = await Prisma.permissionRoles.findFirst({
            where: {
                permissionId,
                userId
            }
        });
        if(checkAlreadyPermissionExist) return new Error("permission already granted to the user");

        let { name } = verifyPermissionExist;
        let { email } = verifyUserExist;

        let create = await Prisma.permissionRoles.create({
            data: {
                permissionId,
                userId,
                scope: `${name}:${permissionId}:secure`
            }
        });

        if(!create) return new Error("error adding user permission");

        new CoreNotificationMailer().addedPermission(email, name)

        return create;
    }

    async removePermissionUser(userId: string, permissionId: string){
        if(!userId || !permissionId) return new Error("parameteres invalid");

        let verifyUserExist = await Prisma.user.findUnique({where: {id: userId}});
        if(!verifyUserExist) return new Error("user not exist");

        let verifyPermissionExist = await Prisma.permission.findUnique({where: {id: permissionId}});
        if(!verifyPermissionExist) return new Error("permission not exist");

        let checkAlreadyPermissionExist = await Prisma.permissionRoles.findFirst({
            where: {
                permissionId,
                userId
            }
        });
        if(!checkAlreadyPermissionExist) return new Error("user without permission granted");

        let { name } = verifyPermissionExist;
        let { email, username } = verifyUserExist;

        let create = await Prisma.permissionRoles.deleteMany({
            where: {
                permissionId,
                userId
            }
        });

        if(!create) return new Error("error remove permission the user");

        new CoreNotificationMailer().removePermission(email, name)

        return {status: true, removed: moment().toISOString(), data: {
            username,
            permissionName: name
        }};
    }

    async list(userId: string){
        if(!userId) return new Error("user id not defined");

        let get = await Prisma.permissionRoles.findMany({
            where: {
                userId
            },
            include: {
                permissionRelation: true
            }
        });

        if(!get) return new Error("error listing permission user");

        return get;
    }
}
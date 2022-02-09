import { Prisma } from "../database/prisma";
import { sendMailer } from "../jobs/sendMailer";
import { v4 as uuidv4 } from "uuid";

export class CoreNotificationMailer {
    async addedPermission(mail: string, permissionName?: string){
        if(!mail) return new Error("mail not defined");

        let getData = await Prisma.user.findFirst({
            where: {
                email: mail
            }
        });

        if(!getData) return new Error("mail not reference user");

        let { name } = getData;
        
        return { status: true, taskId: uuidv4() }
        new sendMailer(mail, name)
        .setBody(`<b>Hello ${name}, new permission added the account: <br> <h3>Permission Name: ${permissionName}<h3></b>`) // BODY MESSAGE
        .setPayload("Permission added the account!", "New Permission!")
        .processSend()
        .getSendId()

    }

    async removePermission(mail: string, permissionName?: string){
        if(!mail) return new Error("mail not defined");

        let getData = await Prisma.user.findFirst({
            where: {
                email: mail
            }
        });

        if(!getData) return new Error("mail not reference user");

        let { name } = getData;

        return { status: true, taskId: uuidv4() }
        new sendMailer(mail, name)
        .setBody(`<b>Hello ${name}, permission removed the account: <br> <h3>Permission Name: ${permissionName}<h3></b>`) // BODY MESSAGE
        .setPayload("Permission removed the account!", "Removed Permission!")
        .processSend()
        .getSendId()

    }
}
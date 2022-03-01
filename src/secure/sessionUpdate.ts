import moment from "moment";
import { Prisma } from "../database/prisma"

export async function sessionIdUpdate(session: string, userId: string){
    if(!session || !userId) return new Error("error internal");

    let update = await Prisma.user.update({
        where: {
            id: userId
        },
        data: {
            sessionId: session,
            lastActive: moment().unix()
        }
    });

    if(!update) return new Error("error internal");

    update.password = undefined;
    update.updatedAt = undefined;
    update.id = undefined;

    return update;
}
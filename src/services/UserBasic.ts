import { User } from "@prisma/client";
import { Prisma } from "../database/prisma";
import { JsonWebToken } from "../jobs/JsonWebToken";
import { hideMaskHalf, hideMaskMail } from "../util/mask";
import adminSafe from '../util/admin';

export class UserBasic {
    async getUserByUsername(username: string): Promise<Error | User>{
        if(!username) return new Error("username not found");

        let user = await Prisma.user.findFirst({
            where: {
                username,
                active: true
            },
            include: {
                roles: true
            }
        });

        if(!user) return new Error("user not exist");

        if(adminSafe(user.roles)) return new Error("user not exist");

        user.email = hideMaskMail(user.email);
        user.cellphone = hideMaskHalf(user.cellphone);
        user.roles = undefined;
        user.password = undefined;
        user.updatedAt = undefined;
        user.sessionId = undefined;
        user.active = undefined;

        return user;
    }

    async getUserById(id: string): Promise<Error | User>{
        if(!id) return new Error("id not found");

        let user = await Prisma.user.findFirst({
            where: {
                id,
                active: true,
                mailConfirmated: true
            }
        });

        if(!user) return new Error("user not exist");

        user.password = undefined;
        user.updatedAt = undefined;

        return user;
    }

    async getUserByIdAndSession(id: string, sessionId: string): Promise<Error | User>{
        if(!id || !sessionId) return new Error("id or session not found");

        let user = await Prisma.user.findFirst({
            where: {
                id,
                sessionId,
                active: true,
                mailConfirmated: true
            }
        });

        if(!user) return new Error("user not exist");

        user.password = undefined;
        user.updatedAt = undefined;

        return user;
    }

    async userInfo(auth: string): Promise<Error | User>{
        if(!auth) return new Error("unauthorized");

        let verify = await new JsonWebToken().verify({bearer: auth, type: "token"});
        if(verify instanceof Error) return new Error(verify.message);
        
        let { client_id, jti } = verify;

        let user = await this.getUserByIdAndSession(client_id, jti);
        if(user instanceof Error) return new Error(user.message);

        return user;
    }
}
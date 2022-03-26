import { User } from '@prisma/client';
import { compareSync } from 'bcrypt';
import moment from 'moment';
import { Prisma } from '../database/prisma';
import { JsonWebToken } from '../jobs/JsonWebToken';
import { Request, Response } from 'express';

export class SignIn {
    async init(request: Request, response?: Response){
       return {}
    }

    async execute({
        username,
        password
    }: {
        username: string;
        password: string;
    }){
        if(!username
            || !password
            || username.length < 3
            || password.length < 6
        ) return new Error("username or password invalid");

        let userVerify = await Prisma.user.findFirst({
            where: {
                username
            },
            include: {
                roles: true
            }
        });

        if(!userVerify) return new Error("username or password invalid");
        
        let { password: encoded, id: userIdentify, active, mailConfirmated, roles, lastActive } = userVerify;
        
        if(!active) return new Error("account desabled");
  
        if(Math.floor(moment().diff(moment.unix(lastActive)) / 1000) <= 10) return new Error("user already logged in, try again a few minutes");
        if(!mailConfirmated) return {error: true, sreen: "mail", id: userIdentify};
        
        if(!this.comparePassword(password, encoded)) return new Error("username or password invalid");

        let sign = await new JsonWebToken().sign({username, userIdentify, roles});
        return sign
    }

    async refreshToken(bearer: string): Promise<Error | (User & {
        token: string;
        refresh: string;
        expire: number;
        client_id: string;
        token_type: string;
        scope: [string];
        jti: string;
    })>{
        if(!bearer) return new Error("unauthorization");

        let verify = await new JsonWebToken().verify({bearer, type: "refresh"});
        if(verify instanceof Error) return new Error(verify.message);

        let { client_id: id, jti } = verify;

        let userData = await Prisma.user.findUnique({
            where: { id },
            include: { roles: true }
        });

        if(!userData) return new Error("session invalid, auth again");

        let { sessionId, active, mailConfirmated, roles, username } = userData;

        if(sessionId !== jti) return new Error("session expired or invalid");
        if(!active) return new Error("account desabled");
        if(!mailConfirmated) return new Error("confirm your email to access your account");

        let sign = new JsonWebToken().sign({ username, userIdentify: id, roles });
        if(sign instanceof Error) return new Error("error internal");

        return sign;
    }

    comparePassword(pass: string, encoded: string): boolean{
        return compareSync(pass, encoded);
    }

    private useSingPem(request: Request){
        let { body, headers } = request,
        device_name = headers["x-device-name"] as string,
        device_id = headers["x-device-id"] as string,
        { authorization } = headers as { authorization: string};

        if(!body || !authorization) return new Error("The given client credentials were not valid").status = 401;
        if(!device_name || !device_id) return new Error("device invalid").status = 488;

        
    }
}
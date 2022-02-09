import { User } from '@prisma/client';
import { compareSync } from 'bcrypt';
import { Prisma } from '../database/prisma';
import { JsonWebToken } from '../jobs/JsonWebToken';

interface iDecodeJwt {
    username: string;
    sub: string;
    jti: string;
    iss: string;
    aud: string;
    client_id: string;
    scope: [string];
    iat: number;
    exp: number;
}

export class SignIn {
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
        
        let { password: encoded, id: userIdentify, active, mailConfirmated, roles } = userVerify;

        if(!active) return new Error("account desabled");
        if(!mailConfirmated) return {error: true, type: "mail", id: userIdentify};

        if(!this.comparePassword(password, encoded)) return new Error("username or password invalid");

        let sign = new JsonWebToken().sign({username, userIdentify, roles});

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
}
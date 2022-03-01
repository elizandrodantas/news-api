import { User } from '@prisma/client';
import { compareSync } from 'bcrypt';
import moment from 'moment';
import { Prisma } from '../database/prisma';
import { JsonWebToken } from '../jobs/JsonWebToken';
import forge from 'node-forge';
import { Request, Response } from 'express';
import uid2 from 'uid2';
import { ForgeSecure } from '../core/Forge';

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
    async init(request: Request, response?: Response){
        let { headers } = request,
        device_name = headers["x-device-name"] as string,
        device_id = headers["x-device-id"] as string,
        { authorization } = headers as { authorization: string }, username = "";

        if(!device_id || !device_name) return new Error(JSON.stringify({
            status: 480,
            message: "device invalid"
        }))

        if(!authorization) return new Error(JSON.stringify({
            status: 480,
            message: "request invalid [2x01 - "+ uid2(16) +"]"
        }));

        if(authorization.indexOf("Basic") !== 0) return new Error(JSON.stringify({
            status: 480,
            message: "request invalid [2x02 - "+ uid2(16) +"]"
        }));
        
        
        try{
            authorization = authorization.split(' ')[1];
            username = forge.util.decode64(authorization);
            username = username.split(':')[0];
            device_id = forge.util.decode64(device_id);
            device_name = forge.util.decode64(device_name);
        }catch(e){
            return new Error(JSON.stringify({
                status: 480,
                message: "request invalid [2x03 - "+ uid2(16) +"]"
            }));
        }

        
        try{
            var create = new ForgeSecure().createRequestCertificate({
                username,
                device_id,
                device_name
            });
        }catch(e){
            return new Error(JSON.stringify({
                status: 500,
                message: "error internal [2x03 - "+ uid2(16) +"]"
            }));
        }

        if(response && response.setHeader){
            response.setHeader("register-task", uid2(64));
            response.setHeader("username", username);
            response.setHeader("pem", create);
        }

        let cert = "-----BEGIN CERTIFICATE-----\n";
        cert+=create;
        cert+="\n-----END CERTIFICATE-----"

        return cert;
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
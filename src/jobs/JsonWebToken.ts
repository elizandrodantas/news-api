import { sign, verify, decode, VerifyErrors } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import ms from 'ms';
import { forgeSecure } from '../secure/forge';
import { sessionIdUpdate } from '../secure/sessionUpdate';
import { PermissionRoles, User } from '@prisma/client';

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

export class JsonWebToken {
    private key: string = process.env.KEY_JWT;

    constructor(
        sub: string = ""
    ){}

    public async sign({
        username,
        userIdentify,
        roles
    }: {
        username: string;
        userIdentify: string;
        roles?: PermissionRoles[]
    }): Promise<Error | (User & {
        token: string;
        refresh: string;
        expire: number;
        client_id: string;
        token_type: string;
        scope: [string];
        jti: string;
    })> {
        if(!username || !userIdentify) return new Error("parameteres invalid");

        let sessionId = uuidv4(), sub = this.createSub(sessionId), aud = uuidv4();
  
        let scope = this.createScope(roles);

        let response = {
            token: sign({
                username,
                sub,
                jti: sessionId,
                iss: process.env.JWT_ISS || "W(+)",
                client_id: userIdentify,
                scope,
            }, this.key, {
                expiresIn: process.env.EXP_JWT || "10m"
            }),
            refresh: sign({
                username,
                sub,
                jti: sessionId,
                iss: process.env.JWT_ISS || "W(+)",
                aud, 
                client_id: userIdentify,
                scope: [...scope, "refresh:" + aud + ":token"]
            }, this.key, {
                expiresIn: "1d"
            }),
            expire: ms(process.env.EXP_JWT || "10m"),
            client_id: userIdentify,
            token_type: "Bearer",
            scope,
            jti: sessionId
        }

        let updateSession = await sessionIdUpdate(sessionId, userIdentify);
        if(updateSession instanceof Error) return new Error(updateSession.message);
        
        return Object.assign({}, updateSession, response);
    }

    public async verify({
        bearer,
        type = "token",
    }: {
        bearer: string,
        type?: "token" | "refresh",
    }): Promise<iDecodeJwt | Error>{
        if(!bearer) return new Error("token not found or invalid");

        let [,token] = bearer.split(' ');

        if(!token || token.indexOf("eyJ") !== 0) return new Error("session invalid")

        let verifyToken: Error | any = await verify(token, this.key, async (err: VerifyErrors, dec: any) => {
            if(err) return new Error("session invalid, try again");

            return dec;
        });

        if(verifyToken instanceof Error) return new Error(verifyToken.message);

        let { sub, jti, scope, aud } = verifyToken;

        if(type === "refresh"){
            if(!scope || typeof scope !== "object" || !aud) return new Error("refresh token invalid");

            let err = true;

            for(let i of scope){
                if(i){
                    let [o,a,t] = i.split(':');
                    if(o === "refresh" && t === "token" && aud === a) err = false;
                }
            }

            if(err) return new Error("scope refresh invalid");
        }

        if(aud && type === "token") return new Error("token format invalid");

        let decSub = this.decodeSub(sub);
        if(decSub instanceof Error) return new Error(decSub.message);

        if(decSub !== jti) return new Error("session invalid, again login");

        return verifyToken;
    }

    public decode({
        bearer
    }: {
        bearer: string
    }){
        if(!bearer) return new Error("token not found");

        let [,token] = bearer.split(' ');

        if(!token || token.indexOf("eyJ") !== 0) return new Error("token invalid");

        return decode(token, {json: true});
    }

    private createSub(string: string){
        let c = forgeSecure, iv = c().iv(), encode = c().encrypt(string, process.env.KEY_FORGE, iv);
        return c().encode64(`${iv}:${encode}`);
    }

    private decodeSub(sub: string){
        if(!sub) return new Error("session invalid");
        let c = forgeSecure, d = c().decode64(sub), s = d.split(':'), v;
        if(!s[0] || !s[1]) return new Error("session invalid");
        return c().decrypt(s[1], process.env.KEY_FORGE, s[0]);
    }

    private createScope(roles: PermissionRoles[]): [string] {
        let response: any = [];

        for(let i of roles){
            response.push(i.scope);
        }

        return response;
    }
}
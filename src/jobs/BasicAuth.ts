import moment from 'moment';

import { Prisma } from '../database/prisma';
import { toUtf8 } from '../util/base64';
import { UserBasic } from '../services/UserBasic';

export class BasicAuth {
    decoded: string;
    code_auth: string;
    client_id: string;
    client_secret: string;
    userId: string;

    constructor(
        auth: string
    ){
        this.code_auth = auth
    }

    decode(string: string): this {
        if(!string) return this;

        try{
            this.decoded = toUtf8(string);
        }catch(e){}

        return this;
    }

    prepare(): Error | this{
        if(!this.code_auth) return new Error("code not declared");

        let [type, client] = this.code_auth.split(' ');

        if(type !== "Basic") return new Error("unauthorized");

        if(!client || client && typeof client !== "string") return new Error("auth formated invalid");

        this.decode(client);

        if(!this.decoded) return new Error("code formated invalid");

        let [ id, secret ] = this.decoded.split(':');

        if(!id || !secret) return new Error("code formated invalid");

        return this.client_id = id, this.client_secret = secret, this;
    }

    async validate(): Promise<Error | { username: string; client_id: string, expire: number; now: number }>{
        if(!this.client_id || !this.client_secret) return new Error("unauthorized");

        let exist = await Prisma.basicAuth.findFirst({
            where: {
                client_id: this.client_id,
                client_secret: this.client_secret,
                expire: {
                    gte: moment().unix()
                }
            }
        });

        if(!exist) return new Error("unauthorized");

        let { expire, UserId } = exist;

        this.userId = UserId;

        let userInfo = await new UserBasic().getUserById(UserId);
        if(userInfo instanceof Error) return new Error(userInfo.message);

        let { username } = userInfo;

        return { username, client_id: UserId, expire, now: moment().unix() }
    }
}
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
export declare class JsonWebToken {
    private key;
    constructor(sub?: string);
    sign({ username, userIdentify, roles }: {
        username: string;
        userIdentify: string;
        roles?: PermissionRoles[];
    }): Promise<Error | (User & {
        token: string;
        refresh: string;
        expire: number;
        client_id: string;
        token_type: string;
        scope: [string];
        jti: string;
    })>;
    verify({ bearer, type, }: {
        bearer: string;
        type?: "token" | "refresh";
    }): Promise<iDecodeJwt | Error>;
    sessionVerify(userId: string, sessionId: string): Promise<Error | User>;
    decode({ bearer }: {
        bearer: string;
    }): Error | import("jsonwebtoken").JwtPayload;
    private createSub;
    private decodeSub;
    private createScope;
}
export {};

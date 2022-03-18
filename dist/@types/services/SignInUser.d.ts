import { User } from '@prisma/client';
import { Request, Response } from 'express';
export declare class SignIn {
    init(request: Request, response?: Response): Promise<{}>;
    execute({ username, password }: {
        username: string;
        password: string;
    }): Promise<Error | (User & {
        token: string;
        refresh: string;
        expire: number;
        client_id: string;
        token_type: string;
        scope: [string];
        jti: string;
    }) | {
        error: boolean;
        sreen: string;
        id: string;
    }>;
    refreshToken(bearer: string): Promise<Error | (User & {
        token: string;
        refresh: string;
        expire: number;
        client_id: string;
        token_type: string;
        scope: [string];
        jti: string;
    })>;
    comparePassword(pass: string, encoded: string): boolean;
    private useSingPem;
}

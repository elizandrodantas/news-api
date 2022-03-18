import { User } from "@prisma/client";
export declare class UserBasic {
    getUserByUsername(username: string): Promise<Error | User>;
    getUserById(id: string): Promise<Error | User>;
    getUserByIdAndSession(id: string, sessionId: string): Promise<Error | User>;
    userInfo(id: string, jti: string): Promise<Error | User>;
    lastActive(id: string, jti: string): Promise<Error | {
        active: boolean;
        lastActive: number;
        sessionId: string;
    }>;
    private updateLastActiveJob;
}

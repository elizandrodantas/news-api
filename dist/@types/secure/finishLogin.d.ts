import { iSchemaUserModel } from "../@types/user";
export declare class finishLogin {
    sessionId: string;
    signature: string;
    result: iSchemaUserModel;
    constructor(sessionId: string, signature: string);
    finish(id: string): Promise<Error | this>;
    get(): iSchemaUserModel;
}

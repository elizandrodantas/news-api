import { iSchemaUserModel } from "../@types/user";
import { User } from "@prisma/client";
declare type iCreateUserPayload = {
    username: string;
    password: string;
    name?: string;
    cell: string;
    email: string;
    lastname: string;
};
export declare class RegisterUser {
    execute(props: iCreateUserPayload): Promise<any | Error>;
    successCreateUser(res: iSchemaUserModel | User | any): Promise<Error | iSchemaUserModel>;
    verifyRegister(param: string, type: "user" | "mail" | "cellphone"): Promise<Error | {
        registered: boolean;
        data: string;
    }>;
    passwordEncrypt(string: string): string;
    private validateParams;
    private abortByError;
}
export {};

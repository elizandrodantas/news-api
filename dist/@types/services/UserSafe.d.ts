declare type iOptionsActionOAuth = "reset" | "block" | "remove" | "unlock" | "create";
declare type iResponseRegisterOAuth = {
    created?: string;
    OAuth?: boolean;
    clientId?: string;
    secretId?: string;
};
interface iResponseActionOAuth extends iResponseRegisterOAuth {
    status: boolean;
    removed?: string;
    block?: string;
    unlock?: string;
}
export declare class UserSafe {
    list(): Promise<Error | any[]>;
    info(id: string, su?: boolean): Promise<Error | (import(".prisma/client").User & {
        roles: import(".prisma/client").PermissionRoles[];
    })>;
    BlockAndUnlok(id: string, action: "block" | "unlock", su: boolean, userId: string): Promise<Error | {
        [x: string]: string | boolean;
        status: boolean;
        su: string;
    }>;
    removeUser(id: string, su: boolean, relativeUser: string): Promise<Error | {
        status: boolean;
        removed: string;
        su: string;
    }>;
    edit(id: string, params: {
        name?: string;
        lastname?: string;
        cellphone?: string;
        email?: string;
        password?: string;
    }, su: boolean): Promise<Error | import(".prisma/client").User>;
    private validateParamsEditUser;
    actionOauth(id: string, action: iOptionsActionOAuth): Promise<Error | iResponseActionOAuth>;
    private OAUTH;
}
export {};

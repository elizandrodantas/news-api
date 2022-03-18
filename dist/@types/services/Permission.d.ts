import { Permission as iPermission } from "@prisma/client";
export declare class Permission {
    addPermission(name: string, description: string): Promise<Error | iPermission>;
    getPermissionByName(name: string): Promise<Error | iPermission>;
    getAllPermission(): Promise<Error | iPermission[]>;
}

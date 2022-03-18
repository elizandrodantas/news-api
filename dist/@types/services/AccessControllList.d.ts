export declare class AccessControlList {
    addPermissionUser(userId: string, permissionId: string): Promise<Error | import(".prisma/client").PermissionRoles>;
    removePermissionUser(userId: string, permissionId: string): Promise<Error | {
        status: boolean;
        removed: string;
        data: {
            username: string;
            permissionName: string;
        };
    }>;
    list(userId: string): Promise<Error | (import(".prisma/client").PermissionRoles & {
        permissionRelation: import(".prisma/client").Permission;
    })[]>;
}

export declare class CoreNotificationMailer {
    addedPermission(mail: string, permissionName?: string): Promise<Error | {
        status: boolean;
        taskId: string;
    }>;
    removePermission(mail: string, permissionName?: string): Promise<Error | {
        status: boolean;
        taskId: string;
    }>;
}

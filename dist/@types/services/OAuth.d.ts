import { Request } from "express";
export declare class OAuth {
    deivceSeekRegister(id: string): Promise<Error | {
        status: boolean;
        sending: string;
        taskId: string;
    }>;
    deviceConfirmRegister(id: string, code: string, request?: Request): Promise<Error | import(".prisma/client").DeviceRegister>;
    deviceList(id: string): Promise<Error | {
        status: boolean;
        data: import(".prisma/client").DeviceRegister[];
    }>;
    private registerNewDevice;
    private updateOptOAuth;
}

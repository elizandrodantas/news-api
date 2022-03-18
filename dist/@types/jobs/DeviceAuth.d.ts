import { Request } from "express";
import { DeviceRegister } from "@prisma/client";
declare type iDevice = {
    device_id: string;
    device_name: string;
};
export declare class DeviceAuth {
    private controller;
    private signedCert;
    private gross;
    private device;
    private credentials;
    private userId;
    private userInfo;
    private aggregedGross;
    prepare(request: Request): this | Error;
    verifyGross(): Error | {
        gross: string;
    };
    verifyDevice(): Error | {
        device: iDevice;
    };
    verifyCredentials(): Promise<Error | DeviceRegister[]>;
    verifyDeviceRegister(): Promise<Error | DeviceRegister>;
}
export {};

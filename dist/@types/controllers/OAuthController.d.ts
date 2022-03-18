import { Request, Response } from "express";
export declare class OAuthController {
    deviceSeekRegister(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    deviceConfirmRegister(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    deviceList(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

import { Request, Response } from "express";
export declare class UserBasicController {
    userInfo(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getByUsername(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    lastActive(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

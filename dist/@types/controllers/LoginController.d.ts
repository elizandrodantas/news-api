import { Request, Response } from "express";
export declare class LoginController {
    init(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    middler(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    refreshToken(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

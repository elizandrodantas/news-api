import { Request, Response } from "express";
export declare class RegisterController {
    middler(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    existUsername(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    existEmail(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    existCell(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

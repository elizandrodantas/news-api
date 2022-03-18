import { Request, Response } from "express";
export declare class AccessControlListController {
    add(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    remove(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    list(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

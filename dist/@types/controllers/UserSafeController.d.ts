import { Request, Response } from "express";
export declare class UserSafeController {
    list(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    info(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    register(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    block(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    unlock(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    remove(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    edit(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    createOauth(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    resetOauth(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    removeOauth(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    blockOauth(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    unlockOauth(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

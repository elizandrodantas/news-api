import { NextFunction, Request, Response } from "express";
export declare class ensuredAuthenticated {
    middler(request: Request, response: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}

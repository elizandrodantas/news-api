import { NextFunction, Request, Response } from "express";
export declare function can(permission: string[]): (request: Request, response: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;

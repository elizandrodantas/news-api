import { Request, Response } from "express";
export declare class TaskOtpController {
    verify(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

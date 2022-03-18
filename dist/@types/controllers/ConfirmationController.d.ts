import { Request, Response } from "express";
export declare class ConfirmationsController {
    mail(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    cell(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    reSendMail(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    reSendCell(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

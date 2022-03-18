import { Request, Response } from "express";
export declare class NewsController {
    listAll(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getOptionsCategories(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    storageFuture(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getStorage(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getContent(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

import { Request, Response } from "express";
export declare class WordPressController {
    status(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getJobsAndServices(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    jobStatus(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    add(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    edit(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    delete(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getTag(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    getCategory(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    addTag(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    addCategory(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    addMedia(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    addPost(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
    statusServices(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

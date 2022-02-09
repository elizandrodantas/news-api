import { Request, Response } from "express";
import { News } from "../services/News";

export class NewsController {
    async listAll(request: Request, response: Response){
        let { category, intitle, limit, source } = request.method === "POST" ? request.body : request.query;

        if(typeof source !== "object" && source){
            source = source.split(',')
        }

        let execute = await new News().listArticle(category, intitle, limit, source);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async getOptionsCategories(request: Request, response: Response){
        let { source } = request.query;

        let get = await new News().getOptionsCategory(source);
        if(get instanceof Error) return response.status(400).json({error: get.message});

        return response.status(200).json(get);
    }
    
    async storageFuture(request: Request, response: Response){
        let { id } = request.params;

        let sing = "";

        if(id.indexOf("https://brasil.elpais.com/") === 0 && !id.match('globo.com/')) sing = "elpais";
        if(id.indexOf("https://brasil.elpais.com/") !== 0 && id.match('globo.com/')) sing = "g1";
        if(/^[0-9a-fA-F]{24}$/.test(id)) sing = "r7";
    
        let execute = await new News().registerStorageFuture(id, sing);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async getStorage(request: Request, response: Response){
        let { id } = request.params;

        let execute = await new News().getStorageFuture(id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async getContent(request: Request, response: Response){
        let { id } = request.params;

        let execute = await new News().getContentByStorage(id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    } 
}
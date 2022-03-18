import { Request, Response } from "express";
import { OAuth } from "../services/OAuth";

export class OAuthController {
    async deviceSeekRegister(request: Request, response: Response){
        let { client_id } = request.decoded;

        let execute = await new OAuth().deivceSeekRegister(client_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async deviceConfirmRegister(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { code } = request.body;

        let execute = await new OAuth().deviceConfirmRegister(client_id, code, request);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async deviceList(request: Request, response: Response){
        let { client_id } = request.decoded;
        
        let execute = await new OAuth().deviceList(client_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }
}
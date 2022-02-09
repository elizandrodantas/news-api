import { Request, Response } from "express";
import { ReSend } from "../services/ReSendConfirmations";
import { Confirmations } from "../services/UserConfirmations";

export class ConfirmationsController {
    async mail(request: Request, response: Response){
        let { code, id } = request.body;

        let execute = await new Confirmations().mail(id, code);
        if(execute instanceof Error) return response.status(400).json({error: execute.message})

        return response.status(200).json(execute);
    }

    async cell(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { code } = request.body;
        
        let execute = await new Confirmations().cell(client_id, code);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async reSendMail(request: Request, response: Response){
        let { client_id } = request.decoded;

        let execute = await new ReSend().mail(client_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute)
    }

    async reSendCell(request: Request, response: Response){
        let { client_id } = request.decoded;
        
        let execute = await new ReSend().cell(client_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }
}
import { Request, Response } from "express";
import { UserBasic } from "../services/UserBasic";

export class UserBasicController {
    async userInfo(request: Request, response: Response){
        let { client_id } = request.decoded;

        let execute = await new UserBasic().userInfo(client_id);
        if(execute instanceof Error) return response.status(401).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async getByUsername(request: Request, response: Response){
        let { username } = request.params;

        let execute = await new UserBasic().getUserByUsername(username);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async lastActive(request: Request, response: Response){
        let { client_id, jti } = request.decoded;

        let execute = await new UserBasic().lastActive(client_id, jti);
        if(execute instanceof Error) return response.status(403).json({error: execute.message});

        return response.status(201).json(execute);
    }
}
import { Request, Response } from "express";
import { RegisterUser } from "../services/RegisterUser";
import { UserSafe } from "../services/UserSafe";

export class UserSafeController {
    async list(request: Request, response: Response){

        let execute = await new UserSafe().list();
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async info(request: Request, response: Response){
        let { id } = request.params;

        let execute = await new UserSafe().info(id, request.su);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async register(request: Request, response: Response){
        let execute = await new RegisterUser().execute(request.body);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async block(request: Request, response: Response){
        let { id } = request.body;

        let execute = await new UserSafe().BlockAndUnlok(id, "block", request.su, request.decoded.client_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async unlock(request: Request, response: Response){
        let { id } = request.body;

        let execute = await new UserSafe().BlockAndUnlok(id, "unlock", request.su, request.decoded.client_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async remove(request: Request, response: Response){
        let { id } = request.body;

        let execute = await new UserSafe().removeUser(id, request.su, request.decoded.client_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async edit(request: Request, response: Response){
        let { id } = request.body;

        let execute = await new UserSafe().edit(id, request.body, request.su);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async createOauth(request: Request, response: Response){
        let { id } = request.body;

        let execute = await new UserSafe().actionOauth(id, "create");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});
        
        return response.status(200).json(execute);
    }

    async resetOauth(request: Request, response: Response){
        let { id } = request.body;

        let execute = await new UserSafe().actionOauth(id, "reset");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});
        
        return response.status(200).json(execute);
    }

    async removeOauth(request: Request, response: Response){
        let { id } = request.body;

        let execute = await new UserSafe().actionOauth(id, "remove");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});
        
        return response.status(200).json(execute);
    }

    async blockOauth(request: Request, response: Response){
        let { id } = request.params;

        let execute = await new UserSafe().actionOauth(id, "block");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});
        
        return response.status(200).json(execute);
    }

    async unlockOauth(request: Request, response: Response){
        let { id } = request.params;

        let execute = await new UserSafe().actionOauth(id, "unlock");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});
        
        return response.status(200).json(execute);
    }
}
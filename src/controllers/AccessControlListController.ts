import { Request, Response } from "express";
import { AccessControlList } from "../services/AccessControllList";

export class AccessControlListController {
    async add(request: Request, response: Response){
        let { user_id, permission_id } = request.body;
        
        let execute = await new AccessControlList().addPermissionUser(user_id, permission_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute)
    }

    async remove(request: Request, response: Response){
        let { user_id, permission_id } = request.body;
        
        let execute = await new AccessControlList().removePermissionUser(user_id, permission_id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute) 
    }

    async list(request: Request, response: Response){
        let { id } = request.params;

        let execute = await new AccessControlList().list(id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute) 
    }
}
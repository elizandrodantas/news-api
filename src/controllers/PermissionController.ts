import { Request, Response } from "express";
import { Prisma } from "../database/prisma";
import { Permission } from "../services/Permission";

export class PermissionController {
    async add(request: Request, response: Response){
        let { name, description } = request.body;

        let execute = await new Permission().addPermission(name, description);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async list(request: Request, response: Response){
        let execute = await new Permission().getAllPermission();
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute)
    }
}
import { Request, Response } from "express";
import { iCreateUserPayload } from "../@types/services";
import { RegisterUser } from "../services/RegisterUser";

export class RegisterController {
    async middler(request: Request, response: Response){
        let create = await new RegisterUser().execute(request.body);
        if(create instanceof Error || !create) return response.status(400).json({error: create.message || "error create user"});

        return response.status(200).json(create);
    }

    async existUsername(request: Request, response: Response){
        let { username } = request.params;

        let execute = await new RegisterUser().verifyRegister(username, "user");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(202).json(execute);
    }

    async existEmail(request: Request, response: Response){
        let { email } = request.params;

        let execute = await new RegisterUser().verifyRegister(email, "mail");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(202).json(execute);
    }

    async existCell(request: Request, response: Response){
        let { cell } = request.params;

        let execute = await new RegisterUser().verifyRegister(cell, "cellphone");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(202).json(execute);
    }
}
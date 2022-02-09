import { Request, Response } from "express";
import { SignIn } from "../services/SignInUser";

export class LoginController {
    async middler(request: Request, response: Response){
        let { username, password } = request.body;

        let login = await new SignIn().execute({username, password});
        if(login instanceof Error) return response.status(401).json({error: login.message});

        return response.send(login)
    }

    async refreshToken(request: Request, response: Response){
        let { authorization } = request.headers;

        let execute = await new SignIn().refreshToken(authorization);
        if(execute instanceof Error) return response.status(401).json({error: execute.message});

        return response.status(200).json(execute);
    }
}
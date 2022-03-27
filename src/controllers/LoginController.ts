import { Request, Response } from "express";
import { SignIn } from "../services/SignInUser";

export class LoginController {
    async middler(request: Request, response: Response){
        let { username, password } = request.body;

        let login = await new SignIn().execute({ username, password });
        if(login instanceof Error) {
            let { message, status } = login;
            status = status ? status : 401;
            try { message = JSON.parse(message) } catch(e) {}

            return response.status(status).json(typeof message === "object" ? message : { error: message });
        }
        return response.status(200).json(login);
    }

    async refreshToken(request: Request, response: Response){
        let { authorization } = request.headers;

        let execute = await new SignIn().refreshToken(authorization);
        if(execute instanceof Error) return response.status(401).json({error: execute.message});

        return response.status(200).json(execute);
    }
}
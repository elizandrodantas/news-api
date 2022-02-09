import { NextFunction, Request, Response } from "express";
import { JsonWebToken } from "../jobs/JsonWebToken";

export class ensuredAuthenticated {
    async middler(request: Request, response: Response, next: NextFunction){
        let { authorization } = request.headers;
        if(!authorization) return response.status(401).json({error: "session invalid"});

        let verifyEnsured = await new JsonWebToken().verify({bearer: authorization, type: "token"});
        if(verifyEnsured instanceof Error) return response.status(401).json({error: verifyEnsured.message});
        request.decoded = verifyEnsured; 
       
        return next(); 
    }
}
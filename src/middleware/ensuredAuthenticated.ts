import { NextFunction, Request, Response } from "express";

import { BasicAuth } from "../jobs/BasicAuth";
import { JsonWebToken } from "../jobs/JsonWebToken";
import { UserBasic } from '../services/UserBasic';

export class ensuredAuthenticated {
    async middler(request: Request, response: Response, next: NextFunction){
        let { authorization } = request.headers;
        if(!authorization) return response.status(401).json({error: "session invalid"});

        if(authorization.indexOf("Bearer") === 0){
            
            let verifyEnsured = await new JsonWebToken().verify({bearer: authorization, type: "token"});
            if(verifyEnsured instanceof Error) return response.status(401).json({error: verifyEnsured.message});
            
            let { client_id, jti } = verifyEnsured;

            let verifySession = await new JsonWebToken().sessionVerify(client_id, jti);
            if(verifySession instanceof Error) return response.status(401).json({error: verifySession.message});
            
            request.decoded = verifyEnsured;
            Promise.resolve([ new UserBasic().updateLastActiveJob(client_id) ]);

            return next();
        }

        if(authorization.indexOf("Basic") === 0){
            let controller = new BasicAuth(authorization), prepare = controller.prepare();

            if(prepare instanceof Error) return response.status(403).json({ error: prepare.message });

            let verify = await controller.validate();
            if(verify instanceof Error) return response.status(403).json({ error: verify.message });

            request.decoded = verify;
            Promise.resolve([ new UserBasic().updateLastActiveJob(controller.userId) ]);
            
            return next(); 
        }

        return response.status(401).json({error: "not authorized"})
    }
}
import { Request, Response } from "express";
import { GetTaskOtp } from "../services/GetTaskOtp";

export class GetOtpTaskController { 
    async middler(request: Request, response: Response){
        let { charge } = request.highPermission;
        let { id } = request.params;

        if(!id) return response.status(400).json({error: "id not defined"});
        if(charge < 10) return response.status(403).json({error: "no permission to access endpoint"});

        let execute = await new GetTaskOtp().execute(id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }
}
import { Request, Response } from "express";
import { TaskOtp } from "../services/TaskOtp";

export class TaskOtpController {
    async verify(request: Request, response: Response){
        let { id } = request.params;

        let execute = await new TaskOtp().verify(id);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }
}
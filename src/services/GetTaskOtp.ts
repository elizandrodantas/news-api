import { OtpModel } from "../database/models/Otp";

export class GetTaskOtp {
    async execute(id: string){
        if(!id) return new Error("tasId not defined");

        let get = await OtpModel.findOne({id});
        if(!get) return new Error("task not found");

        get.secret = undefined;

        return get;
    }
}
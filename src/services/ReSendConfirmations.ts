import { OTP } from "../controllers/otpController";
import { Prisma } from "../database/prisma";
import { RegisterUser } from "./RegisterUser";
import config from '../config/rate';
import { sendSms } from "../jobs/sendSms";
import moment from "moment";
import { sendMailer } from "../jobs/sendMailer";

export class ReSend {
    async mail(id: string): Promise<Error | {
        status: boolean,
        taskId: string,
        sending: string
    }>{
        if(!id) return new Error("user id not declared");

        let user = await Prisma.user.findFirst({
            where: {
                id
            },
            include: { 
                Otp: true
            }
        });

        if(!user) return new Error("user not registered or mail already confirmed");

        let { active, mailConfirmated, Otp, email, name } = user;
        if(!active) return new Error("blocked user");
        if(mailConfirmated) return new Error("mail already confirmed");

        let onlyMailOtp = Otp.filter($ => $.type === "mail" && !$.using);

        if(onlyMailOtp.length > config.confirmations.mail) return new Error("rate confirmations email exceeded");

        let otp = new OTP(id, "mail").generateOtp();
        if(otp instanceof Error) return new Error(otp.message);

        let save = await otp.save();
        if(save instanceof Error) return new Error(save.message);

        let { code, taskId } = save;

        let send = await new sendMailer().setDetails([{
            Email: email,
            Name: name
        }], `<b>Seu codigo de confirmação: ${code}</b>`)
        .setPayload("Seu condigo de confirmação chegou!", "Codigo de confirmação!").send();
        if(send instanceof Error) return save.abortService(taskId), new Error("not possible send mail");

        let get = await send.get();
        if(get instanceof Error) return save.abortService(taskId), new Error(get.message);

        save.updateWorkAgreged(taskId, get.id);

        return {
            status: true,
            taskId,
            sending: moment().toISOString()
        }
    }

    async cell(id: string): Promise<Error | {
        status: boolean,
        taskId: string,
        sending: string
    }>{
        if(!id) return new Error("user id not declared");

        let user = await Prisma.user.findFirst({
            where: {
                id
            },
            include: {
                Otp: true
            }
        });

        if(!user) return new Error("user not registerd");
        
        let { active, cellConfirmated, Otp, cellphone } = user;
        if(!cellphone) return new Error("incomplete registration");
        if(!active) return new Error("blocked user");
        if(cellConfirmated) return new Error("cell already confirmed");

        let onlyCellOtp = Otp.filter($ => $.type === "sms" && !$.using);
        if(onlyCellOtp.length > config.confirmations.sms) return new Error("rate confirmations cellphone exceeded");

        let otp = new OTP(id, "sms").generateOtp();
        if(otp instanceof Error) return new Error(otp.message);

        let save = await otp.save();
        if(save instanceof Error) return new Error(save.message);

        let { code, taskId } = save;
 
        let send = await new sendSms()
        .setOrigin("elizandro")
        .setDetails(cellphone, `Seu codigo de confirmação é: ${code}`)
        .send();
        
        if(send instanceof Error) return save.abortService(taskId), new Error("error send sms");
        
        let get = await send.get();
        if(get instanceof Error) return save.abortService(taskId), new Error("error seding sms");

        save.updateWorkAgreged(taskId, get.id);

        return {
            status: true,
            taskId,
            sending: moment().toISOString()
        }
    }
}
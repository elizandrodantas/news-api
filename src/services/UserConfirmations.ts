import moment from "moment";
import { otp_util } from "../controllers/otpController";
import { Prisma } from "../database/prisma";

export class Confirmations extends otp_util {
    async mail(id: string, code: string): Promise<Error | { status: boolean, confirmed: any}>{
        if(!id || !code) return new Error("user or code invalid");

        let user = await Prisma.otp.findFirst({
            where: {
                code,
                userId: id,
                expireIn: {
                    gte: moment().unix()
                },
                type: "mail",
                using: false
            }
        });
   
        if(!user) return new Error("code invalid or expired");

        return this.updateStatus(id, user.id, "mail"), {status: true, confirmed: moment()}
    }

    async cell(id: string, code: string){
        if(!id || !code) return new Error("user or code invalid");

        let user = await Prisma.otp.findFirst({
            where: {
                code,
                userId: id,
                expireIn: {
                    gte: moment().unix()
                },
                type: "sms",
                using: false
            }
        });

        if(!user) return new Error("code invalid or expired");

        return this.updateStatus(id, user.id, "cell"), {status: true, confirmed: moment()}
    }

    async updateStatus(userId: string, otpId: string, type: "mail" | "cell"): Promise<any> {
        try{
            await Prisma.otp.update({
                where: {
                    id: otpId
                },
                data: {
                    using: true,
                    expireIn: 0
                }
            });

            if(type){
                let data;
                if(type === "mail") data = {mailConfirmated: true};
                if(type === "cell") data = {cellConfirmated: true};
 
                await Prisma.user.update({
                    where: {
                        id: userId
                    },
                    data: data
                });
            }
        }catch(_){}
    }
}
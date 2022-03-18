import moment from "moment";
import { OTP } from "../controllers/otpController";
import { Prisma } from "../database/prisma";
import { sendMailer } from "../jobs/sendMailer";
import config from '../config/rate';
import { ForgeSecure } from "../core/Forge";
import { Request } from "express";

type iParamsRegisterNewDevice = {
    device_id: string;
    device_name: string;
    cert_dn: string;
    signed_cert_base64: string;
    csr_base64: string;
    userId: string;
    grossIdentifier: string;
    grance_expired: number;
}

export class OAuth {
    async deivceSeekRegister(id: string){
        if(!id) return new Error("client id not defined");

        let userExist = await Prisma.user.findFirst({
            where: { id }
        });

        if(!userExist) return new Error("user not registered");
        
        let { name, email, active, mailConfirmated } = userExist;

        if(!active) return new Error("user blocked");
        if(!mailConfirmated) return new Error("email not confirmed");

        let rateSendLimit = await Prisma.otp.findMany({
            where: { userId: id, type: "oauth", expireIn: {
                gte: moment().unix()
            } }
        });

        if(rateSendLimit.length > config.confirmations.oauth) return new Error("limit send confirmation exceeded");

        let otp = new OTP(id, "oauth").generateOtp();
        if(otp instanceof Error) return new Error("error in process");

        let save = await otp.save();
        if(save instanceof Error) return new Error("error in  process");

        let { code, taskId } = save;

        let send = await new sendMailer().setDetails([{
            Name: name,
            Email: email
        }], `Codigo de confirmação para registrar OAuth: ${code}`)
        .setPayload("Seu condigo de confirmação chegou!", "Codigo de Confirmação!")
        .send();
        if(send instanceof Error) return new Error(send.message);

        let get = await send.get();
        if(get instanceof Error) return new Error(get.message);

        save.updateWorkAgreged(taskId, get.id);

        return {
            status: true,
            sending: moment().toISOString(),
            taskId
        }
    }

    async deviceConfirmRegister(id: string, code: string, request?: Request){
        if(!id || !code || typeof code !== 'string') return new Error("parameteres invalid");
        if(code.length !== 6) return new Error("code invalid");

        let confirmCode = await Prisma.otp.findFirst({
            where: { userId: id, type: "oauth", code, using: false, expireIn: {
                gte: moment().unix()
            }}
        });

        if(!confirmCode) return new Error("invalid confirmation");

        let { id: idOtp } = confirmCode;

        let { headers } = request,
        { authorization } = headers,
        device_name = headers["x-device-name"] as string,
        device_id = headers["x-device-id"] as string;

        if(!authorization || !device_id || !device_name) return new Error("request invalid, required: [devices]");

        let controllerForge = new ForgeSecure();
        controllerForge.setCertDN({
            device_id,
            device_name,
            userId: id
        });
        controllerForge.createCertificate();

        let get = controllerForge.getCreateCertificateData(), grossIdentifier = controllerForge.generateGross();

        let { cert_dn, csr_base64, gross, signed_cert_base64 } = get;

        let register = await this.registerNewDevice({
            cert_dn: controllerForge.ArrayToString(cert_dn),
            csr_base64,
            device_id,
            device_name,
            grossIdentifier,
            signed_cert_base64,
            userId: id,
            grance_expired: controllerForge.getGranceExpired()
        });
        if(register instanceof Error) return new Error(register.message);

        this.updateOptOAuth(idOtp);

        return register
    }

    async deviceList(id: string){
        if(!id) return new Error("parameteres invalid");

        let list = await Prisma.deviceRegister.findMany({
            where: {
                userId: id
            }
        });

        return {
            status: true,
            data: list
        }
    }

    private async registerNewDevice(params: iParamsRegisterNewDevice){
        if(params){
            let register = await Prisma.deviceRegister.create({data: params});
            if(!register) return new Error("error register device");

            return register;
        }
    } 

    private async updateOptOAuth(id: string){
        if(id){
            await Prisma.otp.updateMany({
                where: {id},
                data: {
                    expireIn: 0,
                    using: true
                }
            });
        }
    }
}
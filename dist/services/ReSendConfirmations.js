"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReSend = void 0;
const otpController_1 = require("../controllers/otpController");
const prisma_1 = require("../database/prisma");
const rate_1 = __importDefault(require("../config/rate"));
const sendSms_1 = require("../jobs/sendSms");
const moment_1 = __importDefault(require("moment"));
const sendMailer_1 = require("../jobs/sendMailer");
class ReSend {
    async mail(id) {
        if (!id)
            return new Error("user id not declared");
        let user = await prisma_1.Prisma.user.findFirst({
            where: {
                id
            },
            include: {
                Otp: true
            }
        });
        if (!user)
            return new Error("user not registered or mail already confirmed");
        let { active, mailConfirmated, Otp, email, name } = user;
        if (!active)
            return new Error("blocked user");
        if (mailConfirmated)
            return new Error("mail already confirmed");
        let onlyMailOtp = Otp.filter($ => $.type === "mail" && !$.using);
        if (onlyMailOtp.length > rate_1.default.confirmations.mail)
            return new Error("rate confirmations email exceeded");
        let otp = new otpController_1.OTP(id, "mail").generateOtp();
        if (otp instanceof Error)
            return new Error(otp.message);
        let save = await otp.save();
        if (save instanceof Error)
            return new Error(save.message);
        let { code, taskId } = save;
        let send = await new sendMailer_1.sendMailer().setDetails([{
                Email: email,
                Name: name
            }], `<b>Seu codigo de confirmação: ${code}</b>`)
            .setPayload("Seu condigo de confirmação chegou!", "Codigo de confirmação!").send();
        if (send instanceof Error)
            return save.abortService(taskId), new Error("not possible send mail");
        let get = await send.get();
        if (get instanceof Error)
            return save.abortService(taskId), new Error(get.message);
        save.updateWorkAgreged(taskId, get.id);
        return {
            status: true,
            taskId,
            sending: (0, moment_1.default)().toISOString()
        };
    }
    async cell(id) {
        if (!id)
            return new Error("user id not declared");
        let user = await prisma_1.Prisma.user.findFirst({
            where: {
                id
            },
            include: {
                Otp: true
            }
        });
        if (!user)
            return new Error("user not registerd");
        let { active, cellConfirmated, Otp, cellphone } = user;
        if (!cellphone)
            return new Error("incomplete registration");
        if (!active)
            return new Error("blocked user");
        if (cellConfirmated)
            return new Error("cell already confirmed");
        let onlyCellOtp = Otp.filter($ => $.type === "sms" && !$.using);
        if (onlyCellOtp.length > rate_1.default.confirmations.sms)
            return new Error("rate confirmations cellphone exceeded");
        let otp = new otpController_1.OTP(id, "sms").generateOtp();
        if (otp instanceof Error)
            return new Error(otp.message);
        let save = await otp.save();
        if (save instanceof Error)
            return new Error(save.message);
        let { code, taskId } = save;
        let send = await new sendSms_1.sendSms()
            .setOrigin("elizandro")
            .setDetails(cellphone, `Seu codigo de confirmação é: ${code}`)
            .send();
        if (send instanceof Error)
            return save.abortService(taskId), new Error("error send sms");
        let get = await send.get();
        if (get instanceof Error)
            return save.abortService(taskId), new Error("error seding sms");
        save.updateWorkAgreged(taskId, get.id);
        return {
            status: true,
            taskId,
            sending: (0, moment_1.default)().toISOString()
        };
    }
}
exports.ReSend = ReSend;

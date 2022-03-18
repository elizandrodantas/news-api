"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth = void 0;
const moment_1 = __importDefault(require("moment"));
const otpController_1 = require("../controllers/otpController");
const prisma_1 = require("../database/prisma");
const sendMailer_1 = require("../jobs/sendMailer");
const rate_1 = __importDefault(require("../config/rate"));
const Forge_1 = require("../core/Forge");
class OAuth {
    async deivceSeekRegister(id) {
        if (!id)
            return new Error("client id not defined");
        let userExist = await prisma_1.Prisma.user.findFirst({
            where: { id }
        });
        if (!userExist)
            return new Error("user not registered");
        let { name, email, active, mailConfirmated } = userExist;
        if (!active)
            return new Error("user blocked");
        if (!mailConfirmated)
            return new Error("email not confirmed");
        let rateSendLimit = await prisma_1.Prisma.otp.findMany({
            where: { userId: id, type: "oauth", expireIn: {
                    gte: (0, moment_1.default)().unix()
                } }
        });
        if (rateSendLimit.length > rate_1.default.confirmations.oauth)
            return new Error("limit send confirmation exceeded");
        let otp = new otpController_1.OTP(id, "oauth").generateOtp();
        if (otp instanceof Error)
            return new Error("error in process");
        let save = await otp.save();
        if (save instanceof Error)
            return new Error("error in  process");
        let { code, taskId } = save;
        let send = await new sendMailer_1.sendMailer().setDetails([{
                Name: name,
                Email: email
            }], `Codigo de confirmação para registrar OAuth: ${code}`)
            .setPayload("Seu condigo de confirmação chegou!", "Codigo de Confirmação!")
            .send();
        if (send instanceof Error)
            return new Error(send.message);
        let get = await send.get();
        if (get instanceof Error)
            return new Error(get.message);
        save.updateWorkAgreged(taskId, get.id);
        return {
            status: true,
            sending: (0, moment_1.default)().toISOString(),
            taskId
        };
    }
    async deviceConfirmRegister(id, code, request) {
        if (!id || !code || typeof code !== 'string')
            return new Error("parameteres invalid");
        if (code.length !== 6)
            return new Error("code invalid");
        let confirmCode = await prisma_1.Prisma.otp.findFirst({
            where: { userId: id, type: "oauth", code, using: false, expireIn: {
                    gte: (0, moment_1.default)().unix()
                } }
        });
        if (!confirmCode)
            return new Error("invalid confirmation");
        let { id: idOtp } = confirmCode;
        let { headers } = request, { authorization } = headers, device_name = headers["x-device-name"], device_id = headers["x-device-id"];
        if (!authorization || !device_id || !device_name)
            return new Error("request invalid, required: [devices]");
        let controllerForge = new Forge_1.ForgeSecure();
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
        if (register instanceof Error)
            return new Error(register.message);
        this.updateOptOAuth(idOtp);
        return register;
    }
    async deviceList(id) {
        if (!id)
            return new Error("parameteres invalid");
        let list = await prisma_1.Prisma.deviceRegister.findMany({
            where: {
                userId: id
            }
        });
        return {
            status: true,
            data: list
        };
    }
    async registerNewDevice(params) {
        if (params) {
            let register = await prisma_1.Prisma.deviceRegister.create({ data: params });
            if (!register)
                return new Error("error register device");
            return register;
        }
    }
    async updateOptOAuth(id) {
        if (id) {
            await prisma_1.Prisma.otp.updateMany({
                where: { id },
                data: {
                    expireIn: 0,
                    using: true
                }
            });
        }
    }
}
exports.OAuth = OAuth;

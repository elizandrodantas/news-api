"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUser = void 0;
const bcrypt_1 = require("bcrypt");
const otpController_1 = require("../controllers/otpController");
const prisma_1 = require("../database/prisma");
const sendMailer_1 = require("../jobs/sendMailer");
class RegisterUser {
    async execute(props) {
        let { username, password, name, lastname, cell, email } = props;
        let errors = this.validateParams(props);
        if (errors.length > 0)
            return new Error(errors.join("; "));
        if (await prisma_1.Prisma.user.findUnique({ where: { username } }))
            return new Error("username already exist");
        if (await prisma_1.Prisma.user.findFirst({ where: { email } }))
            return new Error("email already exist");
        if (await prisma_1.Prisma.user.findFirst({ where: { cellphone: cell } }))
            return new Error("cellphone already exist");
        password = this.passwordEncrypt(password);
        return await prisma_1.Prisma.user.create({ data: {
                name,
                username,
                password,
                cellphone: cell,
                email,
                lastname
            } })
            .then((_) => this.successCreateUser(_))
            .catch(e => new Error("error create new user"));
    }
    async successCreateUser(res) {
        res.password = undefined;
        res.updatedAt = undefined;
        let otp = new otpController_1.OTP(res.id, "mail").generateOtp();
        if (otp instanceof Error)
            return this.abortByError(res.id), new Error(otp.message);
        let save = await otp.save();
        if (save instanceof Error)
            return this.abortByError(res.id), new Error(save.message);
        let { code, taskId } = save;
        let { name, email } = res;
        let send = await new sendMailer_1.sendMailer().setDetails([{
                Name: name,
                Email: email
            }], `Seu codigo de confirmação: <b>${code}</b>`)
            .setPayload("Seu condigo de confirmação chegou!", "Codigo de Confirmação!")
            .send();
        if (send instanceof Error)
            return save.abortService(taskId), new Error(send.message);
        let get = await send.get();
        if (get instanceof Error)
            return save.abortService(taskId), new Error(get.message);
        save.updateWorkAgreged(taskId, get.id);
        res.taskMailSend = save.taskId;
        return res;
    }
    async verifyRegister(param, type) {
        if (!param || !type)
            return new Error("param not defined");
        let work = {
            user: function () {
                return prisma_1.Prisma.user.findFirst({ where: { username: param } });
            },
            mail: function () {
                return prisma_1.Prisma.user.findFirst({ where: { email: param } });
            },
            cellphone: function () {
                return prisma_1.Prisma.user.findFirst({ where: { cellphone: param } });
            }
        };
        let find = await Promise.resolve(work[type]());
        if (!find)
            return { registered: false, data: param };
        return { registered: true, data: param };
    }
    passwordEncrypt(string) {
        return (0, bcrypt_1.hashSync)(string, +process.env.SALT_BCRYPT);
    }
    validateParams({ name, password, username, cell, email, lastname }) {
        let response = [];
        if (!name)
            response.push("name not found");
        if (!username)
            response.push("username not found");
        if (!password)
            response.push("password not found");
        if (!cell)
            response.push("cell not found");
        if (!email)
            response.push("email not found");
        if (!lastname)
            response.push("lastname not found");
        if (response.length > 0)
            return response;
        if (username.length < 3)
            response.push("user must contain at least 3 characters");
        if (password.length < 6)
            response.push("password must contain at least 3 characters");
        if (name.length < 3)
            response.push("name must contain at least 3 characters");
        if (/^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/i.test(email) === false)
            response.push("email invalid");
        if (!/^[0-9]{2}9[0-9]{4}[-\s\.]?[0-9]{4}$$/.test(cell))
            response.push("cell number invalid");
        return response;
    }
    async abortByError(id) {
        if (id) {
            try {
                await prisma_1.Prisma.user.delete({ where: { id } });
            }
            catch (_) { }
        }
    }
}
exports.RegisterUser = RegisterUser;

import { hashSync } from "bcrypt";
import { iSchemaUserModel } from "../@types/user";
import { OTP } from "../controllers/otpController";
import { Prisma } from "../database/prisma";
import { User } from "@prisma/client";
import { sendMailer } from "../jobs/sendMailer";

type iCreateUserPayload = {
    username: string;
    password: string;
    name?: string;
    cell: string;
    email: string;
    lastname: string;
}

export class RegisterUser {
    async execute(props: iCreateUserPayload): Promise<any | Error>{
        let { username, password, name, lastname, cell, email } = props;

        let errors = this.validateParams(props);

        if(errors.length > 0) return new Error(errors.join("; "));

        if(await Prisma.user.findUnique({where: {username}})) return new Error("username already exist")
        if(await Prisma.user.findFirst({where: {email}})) return new Error("email already exist")
        if(await Prisma.user.findFirst({where: {cellphone: cell}})) return new Error("cellphone already exist")

        password = this.passwordEncrypt(password);

        return await Prisma.user.create({data: {
            name,
            username,
            password,
            cellphone: cell,
            email,
            lastname
        }})
        .then((_: any) => this.successCreateUser(_))
        .catch(e => new Error("error create new user"))
    }

    async successCreateUser(res: iSchemaUserModel | User | any): Promise<Error | iSchemaUserModel>{
        res.password = undefined;
        res.updatedAt = undefined;

        let otp = new OTP(res.id, "mail").generateOtp();
        if(otp instanceof Error) return this.abortByError(res.id), new Error(otp.message);

        let save = await otp.save();
        if(save instanceof Error) return this.abortByError(res.id), new Error(save.message);
   
        let { code, taskId } = save;
        let { name, email } = res;

        let send = await new sendMailer().setDetails([{
            Name: name,
            Email: email
        }], `Seu codigo de confirmação: <b>${code}</b>`)
        .setPayload("Seu condigo de confirmação chegou!", "Codigo de Confirmação!")
        .send();
        if(send instanceof Error) return save.abortService(taskId), new Error(send.message);

        let get = await send.get();
        if(get instanceof Error) return save.abortService(taskId), new Error(get.message);

        save.updateWorkAgreged(taskId, get.id);

        res.taskMailSend = save.taskId;

        return res;
    }

    async verifyRegister(param: string, type: "user" | "mail" | "cellphone"): Promise<Error | {
        registered: boolean;
        data: string;
    }>{
        if(!param || !type) return new Error("param not defined");

        let work = {
            user: function(){
                return Prisma.user.findFirst({ where: { username: param }});
            },
            mail: function(){
                return Prisma.user.findFirst({ where: { email: param }});
            },
            cellphone: function(){
                return Prisma.user.findFirst({ where: { cellphone: param }});
            }
        }

        let find = await Promise.resolve(work[type]());
 
        if(!find) return { registered: false, data: param }

        return { registered: true, data: param }
    }

    public passwordEncrypt(string: string): string{
        return hashSync(string, +process.env.SALT_BCRYPT);
    }

    private validateParams({
        name, password, username, cell, email, lastname
    }: iCreateUserPayload){
        let response = [];

        if(!name) response.push("name not found");
        if(!username) response.push("username not found");
        if(!password) response.push("password not found");
        if(!cell) response.push("cell not found");
        if(!email) response.push("email not found");
        if(!lastname) response.push("lastname not found");

        if(response.length > 0) return response; // EVITA UM ERROR;
        
        if(username.length < 3) response.push("user must contain at least 3 characters");
        if(password.length < 6) response.push("password must contain at least 3 characters");
        if(name.length < 3) response.push("name must contain at least 3 characters");
        if(/^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/i.test(email) === false) response.push("email invalid");
        if(!/^[0-9]{2}9[0-9]{4}[-\s\.]?[0-9]{4}$$/.test(cell)) response.push("cell number invalid");

        return response;
    }

    private async abortByError(id: string): Promise<void> {
        if(id){
            try{
                await Prisma.user.delete({where: {id}});
            }catch(_){}
        }
    }
}
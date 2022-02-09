import moment from "moment";
import { Prisma } from "../database/prisma";
import { RegisterUser } from "./RegisterUser";

export class UserSafe {
    async list(): Promise<Error | any[]>{
        let get = await Prisma.user.findMany({
            select: {
               id: true,
               username: true,
               name: true,
               lastname: true,
               cellphone: true,
               email: true,
               sessionId: true,
               mailConfirmated: true,
               cellConfirmated: true,
               active: true,
               createdAt: true
            }
        });

        if(!get) return new Error("error get list users");

        return get;
    }

    async info(id: string){
        if(!id) return new Error("id not defined");

        let get = await Prisma.user.findFirst({
            where: {
                id
            },
            include: {
                roles: true
            }
        });

        if(!get) return new Error("user not exist");

        let { roles } = get;

        let scope = [];

        for(let index of roles){
            if(index) scope.push(
                    await Prisma.permission.findFirst({
                        where: {
                            id: index.permissionId
                        }
                    })
                )
        };

        get.roles = scope;

        return get;
    }

    async BlockAndUnlok(id: string, action: "block" | "unlock", su: boolean = false, userId: string){
        if(!id || !action) return new Error("id not defined or invalid");
        if(id === userId) return new Error("it is not possible to self block");

        let verifyUserExist = await Prisma.user.findUnique({
            where: {
                id
            },
            include: {
                roles: true
            }
        });

        if(!verifyUserExist) return new Error("user not exist");
    
        let { active, roles } = verifyUserExist;

        if(action === "block" && !active) return new Error("user already blocked");
        if(action === "unlock" && active) return new Error("user already unlocked");

        let typping = { 
            su: function(){
                return roles.some(i => i && i.scope.split(':')[0] === process.env.SU_ADMIN || i.scope.split(':')[0] === process.env.MO_ADMIN);
            },
            block: function(){
                return Prisma.user.update({
                    where: {
                        id
                    },
                    data: {
                        active: false
                    }
                });
            },
            unlock: function(){
                return Prisma.user.update({
                    where: {
                        id
                    },
                    data: {
                        active: true
                    }
                });
            }
        }
        
        let status = false;

        if(!su){
            if(!typping.su()){
                let work = await Promise.resolve(typping[action]());
                if(!work) return new Error("error " + action + " user");
                status = true;
            }else{
                return new Error("no permission to block user");
            }
        }else{
            let work = await Promise.resolve(typping[action]());
            if(!work) return new Error("error " + action + " user");
            status = true;
        }

        return {
            status,
            [action]: moment().toISOString(),
            su: su ? "superadmin" : undefined
        }
    }

    async removeUser(id: string, su: boolean = false, relativeUser: string){
        if(!id) return new Error("error removing user");

        if(id === relativeUser) return new Error("not possible remove profile self");

        if(!su) return new Error("no permission for user remover");

        let verifyUserExist = await Prisma.user.findUnique({ where: { id }});
        if(!verifyUserExist) return new Error("user not exist");

        await Prisma.user.update({
            where: { id },
            data: {
                Otp: {
                    deleteMany: {}
                },
                roles: {
                    deleteMany: {}
                }
            }
        });

        let removeUser = await Prisma.user.delete({
            where: { id }
        })

        if(!removeUser) return new Error("error remove user");

        return {
            status: true,
            removed: moment().toISOString(),
            su: "superadmin"
        }
    }

    async edit(id: string, params: {
        name?: string;
        lastname?: string;
        cellphone?: string;
        email?: string;
        password?: string;
    }, su: boolean){
        if(!id) return new Error("user not selected");

        let user = await Prisma.user.findUnique({where: { id }, include: { roles: true }});

        if(!user) return new Error("user not exist");

        let { roles } = user;

        if(roles.some(i => i && i.scope.split(':')[0] === process.env.SU_ADMIN) && !su) return new Error("not permision edit user");

        let data: {
            name?: string;
            lastname?: string;
            cellphone?: string;
            email?: string;
            password?: string;
        } = {};

        for(let index in params){
            if(this.validateParamsEditUser(params[index], index)){
                if(index === "password"){
                    data[index] = new RegisterUser().passwordEncrypt(params[index])
                }else{
                    data[index] = params[index]
                }
            }
        }

        let update = await Prisma.user.update({
            where: {
                id
            },
            data
        });

        if(!update) return new Error("error edit user");

        update.password = params["password"];

        return update;
    }

    private validateParamsEditUser(param: string, type: "email" | "name" | "lastname" | "cellphone" | string){
        let required = {
            email: (() => /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/i.test(param))(),
            cellphone: (() => /^[0-9]{2}9[0-9]{4}[-\s\.]?[0-9]{4}$$/.test(param))(),
            name: (() => param.length > 3)(),
            password: (() => param.length > 6)()
        }

        return required[type];
    }
}
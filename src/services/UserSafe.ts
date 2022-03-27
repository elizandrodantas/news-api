import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { User } from "@prisma/client";

import { Prisma } from "../database/prisma";
import { RegisterUser } from "./RegisterUser";
import { admin, moderator } from "../util/admin";

export class UserSafe {
    async list(): Promise<Error | {status: boolean; count: number; data: User[]}>{
        let get = await Prisma.user.findMany({
            include: {
                roles: true,
                basic_relation: {
                    where: {
                        expire: {
                            gte: moment().unix()
                        }
                    }
                }
            }
        }), response = [];

        if(get.length > 0){
            for(let indice of get){
                if(!admin(indice.roles)){
                    indice.roles = undefined;
                    indice.password = undefined;
                    indice.updatedAt = undefined;
                    indice.basic_relation = indice.basic_relation.length as any;
            
                    response.push(indice);
                }
            }
        }
        
        return {
            status: true,
            count: response.length,
            data: response
        };
    }

    async info(id: string, su: boolean = false){ 
        if(!id) return new Error("id not defined");

        let get = await Prisma.user.findFirst({
            where: {
                id
            },
            include: {
                roles: true,
                basic_relation: {
                    where: {
                        expire: {
                            gte: moment().unix()
                        }
                    }
                }
            }
        });
    
        if(!get) return new Error("user not exist");
        if(admin(get.roles) && !su) return new Error("user without permission");

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
        get.password = undefined;

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
            },
        }
        
        let status = false, work = null;

        if(admin(roles)) return new Error("unable to "+ action +" an admin");
        if(moderator(roles) && !su) return new Error("unable to "+ action +" moderators");

        work = await typping[action]();
        if(!work) return new Error("error " + action + " user");
        status = true;

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

        let verifyUserExist = await Prisma.user.findUnique({ where: { id } });
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
    }, su: boolean = false, userId: string = ""){
        if(!id) return new Error("user not selected");
        
        let user = await Prisma.user.findUnique({where: { id }, include: { roles: true }});

        if(!user) return new Error("user not exist");

        if(admin(user.roles) && !su) return new Error("not permision edit user");
        if(moderator(user.roles) && id !== userId) return new Error("no permission to change moderator account");

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

    // ########### BASIC AUTHORIZATION ############ //

    async createBasic(userId: string, expire: string | number | null = null, su: boolean = false){
        if(!userId) return new Error("user not found");
        
        let expiredExpected = null, typeExpire: "d" | "h" | "m" | "s" | "M" | "w" = "m";

        if(su && expire){
            if(typeof expire === "string"){
                let firsh = Number(String(expire).replace(/([^\d])+/gim, '')), type = String(expire).replace(/[0-9]/g, '');
        
                if(firsh && firsh > 0) expiredExpected = firsh;

                if(type){
                    if(["day", "days", "d", "D", "dia", "dias"].includes(type)) typeExpire = "d";
                    if(["weeks", "week", "w", "W", "semana", "semanas"].includes(type)) typeExpire = "w";
                    if(["hours", "h", "H", "horas", "hora"].includes(type)) typeExpire = "h";
                    if(["minutes", "minute", "m", "M", "minutos", "minuto"].includes(type)) typeExpire = "m";
                    if(["months", "month", "mo", "MO", "Mo", "mO", "mes", "meses"].includes(type)) typeExpire = "M";
                }
            }

            if(typeof expire === "number"){
                if(expire > 0) expiredExpected = expire
            }
        }else{
            expiredExpected = 60;
        }

        let setExp = this.generateExp(expiredExpected, typeExpire), client_id = uuidv4(), client_secret = uuidv4();
        
        if(setExp > 21.47 * Math.pow(10, 8)) return new Error("it is not possible to set all this expiry time");
        
        if(!su){
            let existAuth = await this.listBasicAuth(userId);

            if(existAuth.length > 0) return new Error("there is a basic auth already configured in the account");
        }

        let verifyUserSecure = await Prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true }
        });

        if(!verifyUserSecure) return new Error("user not found");
      
        if(admin(verifyUserSecure.roles) && !su) return new Error("no permission to modify this user");

        let create = await Prisma.basicAuth.create({
            data: {
                client_id,
                client_secret,
                expire: setExp,
                UserId: userId
            }
        })
        .catch(() => null);

        if(!create) return new Error("error created basic auth");
        
        return {
            status: true,
            createdAt: moment().toISOString(),
            client_id,
            client_secret,
            expire: setExp
        }
    }

    async userListBasicAuth(userId: string){
        if(!userId) return new Error("user not declared");

        let allBasicAuth = await this.listBasicAuth(userId);

        return {
            status: true,
            count: allBasicAuth.length,
            data: allBasicAuth
        }
    }

    async listBasicAuth(userId: string){
        return await Prisma.basicAuth.findMany({
            where: {
                UserId: userId,
                expire: {
                    gte: moment().unix()
                }
            }
        });
    }

    // ########### UTIL ############# //

    private validateParamsEditUser(param: string, type: "email" | "name" | "lastname" | "cellphone" | string){
        let required = {
            email: (() => /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/i.test(param))(),
            cellphone: (() => /^[0-9]{2}9[0-9]{4}[-\s\.]?[0-9]{4}$$/.test(param))(),
            name: (() => param.length > 3)(),
            password: (() => param.length > 6)()
        }

        return required[type];
    }

    private generateExp(time: number = 1, short: "d" | "h" | "m" | "s" | "M" | "w" = "m"): number{
        return moment().add(time, short).unix();
    }
}
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSafe = void 0;
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../database/prisma");
const RegisterUser_1 = require("./RegisterUser");
const uuid_1 = require("uuid");
const admin_1 = __importDefault(require("../util/admin"));
class UserSafe {
    async list() {
        let get = await prisma_1.Prisma.user.findMany({
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
        if (!get)
            return new Error("error get list users");
        return get;
    }
    async info(id, su = false) {
        if (!id)
            return new Error("id not defined");
        let get = await prisma_1.Prisma.user.findFirst({
            where: {
                id
            },
            include: {
                roles: true
            }
        });
        if (!get)
            return new Error("user not exist");
        if ((0, admin_1.default)(get.roles) && !su)
            return new Error("user without permission");
        let { roles } = get;
        let scope = [];
        for (let index of roles) {
            if (index)
                scope.push(await prisma_1.Prisma.permission.findFirst({
                    where: {
                        id: index.permissionId
                    }
                }));
        }
        ;
        get.roles = scope;
        return get;
    }
    async BlockAndUnlok(id, action, su = false, userId) {
        if (!id || !action)
            return new Error("id not defined or invalid");
        if (id === userId)
            return new Error("it is not possible to self block");
        let verifyUserExist = await prisma_1.Prisma.user.findUnique({
            where: {
                id
            },
            include: {
                roles: true
            }
        });
        if (!verifyUserExist)
            return new Error("user not exist");
        let { active, roles } = verifyUserExist;
        if (action === "block" && !active)
            return new Error("user already blocked");
        if (action === "unlock" && active)
            return new Error("user already unlocked");
        let typping = {
            su: function () {
                return roles.some(i => i && i.scope.split(':')[0] === process.env.SU_ADMIN || i.scope.split(':')[0] === process.env.MO_ADMIN);
            },
            block: function () {
                return prisma_1.Prisma.user.update({
                    where: {
                        id
                    },
                    data: {
                        active: false
                    }
                });
            },
            unlock: function () {
                return prisma_1.Prisma.user.update({
                    where: {
                        id
                    },
                    data: {
                        active: true
                    }
                });
            }
        };
        let status = false;
        if (!su) {
            if (!typping.su()) {
                let work = await Promise.resolve(typping[action]());
                if (!work)
                    return new Error("error " + action + " user");
                status = true;
            }
            else {
                return new Error("no permission to block user");
            }
        }
        else {
            let work = await Promise.resolve(typping[action]());
            if (!work)
                return new Error("error " + action + " user");
            status = true;
        }
        return {
            status,
            [action]: (0, moment_1.default)().toISOString(),
            su: su ? "superadmin" : undefined
        };
    }
    async removeUser(id, su = false, relativeUser) {
        if (!id)
            return new Error("error removing user");
        if (id === relativeUser)
            return new Error("not possible remove profile self");
        if (!su)
            return new Error("no permission for user remover");
        let verifyUserExist = await prisma_1.Prisma.user.findUnique({ where: { id } });
        if (!verifyUserExist)
            return new Error("user not exist");
        await prisma_1.Prisma.user.update({
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
        let removeUser = await prisma_1.Prisma.user.delete({
            where: { id }
        });
        if (!removeUser)
            return new Error("error remove user");
        return {
            status: true,
            removed: (0, moment_1.default)().toISOString(),
            su: "superadmin"
        };
    }
    async edit(id, params, su) {
        if (!id)
            return new Error("user not selected");
        let user = await prisma_1.Prisma.user.findUnique({ where: { id }, include: { roles: true } });
        if (!user)
            return new Error("user not exist");
        if ((0, admin_1.default)(user.roles) && !su)
            return new Error("not permision edit user");
        let data = {};
        for (let index in params) {
            if (this.validateParamsEditUser(params[index], index)) {
                if (index === "password") {
                    data[index] = new RegisterUser_1.RegisterUser().passwordEncrypt(params[index]);
                }
                else {
                    data[index] = params[index];
                }
            }
        }
        let update = await prisma_1.Prisma.user.update({
            where: {
                id
            },
            data
        });
        if (!update)
            return new Error("error edit user");
        update.password = params["password"];
        return update;
    }
    validateParamsEditUser(param, type) {
        let required = {
            email: (() => /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/i.test(param))(),
            cellphone: (() => /^[0-9]{2}9[0-9]{4}[-\s\.]?[0-9]{4}$$/.test(param))(),
            name: (() => param.length > 3)(),
            password: (() => param.length > 6)()
        };
        return required[type];
    }
    async actionOauth(id, action) {
        if (!id)
            return new Error("user not found");
        let user = await prisma_1.Prisma.user.findUnique({ where: { id } });
        if (!user)
            return new Error("user not exist");
        let { OAuth, clientId, secretId } = user;
        if (action === "create") {
            if (OAuth || clientId && secretId)
                return new Error("OAuth already register");
        }
        if (action === "remove") {
            if (!OAuth || !clientId || !secretId)
                return new Error("OAuth already removed");
        }
        if (action === "block" || action === "unlock") {
            if (!clientId && !secretId)
                return new Error("OAuth not registered");
        }
        if (action === "block") {
            if (!OAuth)
                return new Error("OAuth already blocked");
        }
        if (action === "unlock") {
            if (OAuth)
                return new Error("OAuth already unlocked");
        }
        let up = await this.OAUTH(id, action);
        if (up instanceof Error)
            return new Error(up.message);
        return up;
    }
    async OAUTH(id, action) {
        if (!id)
            return new Error("user id not defined");
        if (action === "create" || action === "reset") {
            let json = {
                OAuth: true,
                secretId: (0, uuid_1.v4)(),
                clientId: (0, uuid_1.v4)()
            };
            let up = await prisma_1.Prisma.user.update({
                where: { id },
                data: json
            });
            if (!up)
                return new Error("error create new OAuth");
            return {
                status: true,
                created: (0, moment_1.default)().toISOString(),
                ...json
            };
        }
        if (action === "remove") {
            let up = await prisma_1.Prisma.user.update({
                where: { id },
                data: { OAuth: false, clientId: null, secretId: null }
            });
            if (!up)
                return new Error("error remove OAuth");
            return {
                status: true,
                removed: (0, moment_1.default)().toISOString()
            };
        }
        if (action === "block" || action === "unlock") {
            let json = { OAuth: action === "block" ? false : true };
            let up = await prisma_1.Prisma.user.update({
                where: { id },
                data: json
            });
            if (!up)
                return new Error("error " + action + " user");
            return {
                status: true,
                [action]: (0, moment_1.default)().toISOString()
            };
        }
        return new Error("action not defined or not found");
    }
}
exports.UserSafe = UserSafe;

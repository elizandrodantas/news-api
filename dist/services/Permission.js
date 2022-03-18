"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = void 0;
const prisma_1 = require("../database/prisma");
class Permission {
    async addPermission(name, description) {
        if (!name || !description)
            return new Error("name or description invalid");
        let verifyExist = await this.getPermissionByName(name);
        if (!(verifyExist instanceof Error))
            return new Error("permission already registered");
        let create = await prisma_1.Prisma.permission.create({
            data: {
                name,
                description
            }
        });
        if (create instanceof Error)
            return new Error("error create permission");
        return create;
    }
    async getPermissionByName(name) {
        if (!name)
            return new Error("name not defined");
        let get = await prisma_1.Prisma.permission.findFirst({
            where: {
                name
            }
        });
        if (!get)
            return new Error("permission not exist");
        return get;
    }
    async getAllPermission() {
        let get = await prisma_1.Prisma.permission.findMany();
        if (get instanceof Error)
            return new Error("error get all permission");
        return get;
    }
}
exports.Permission = Permission;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.can = void 0;
const prisma_1 = require("../database/prisma");
function can(permission) {
    return async (request, response, next) => {
        try {
            let { client_id: userId } = request.decoded;
            if (!userId)
                throw new Error("not authorization");
            let getAllPermission = await prisma_1.Prisma.permissionRoles.findMany({
                where: {
                    userId
                },
                include: {
                    permissionRelation: true
                }
            });
            if (getAllPermission.length <= 0)
                throw new Error("not authorization");
            let authorized = false;
            for (let index of getAllPermission) {
                let { permissionRelation } = index;
                if (permissionRelation) {
                    let { name } = permissionRelation;
                    if (permission.includes(name)) {
                        authorized = true;
                    }
                    if (process.env.SU_ADMIN && process.env.SU_ADMIN === name) {
                        request.su = true;
                    }
                }
            }
            if (!authorized)
                throw new Error("not authorization");
            return next();
        }
        catch (_) {
            return response.status(403).json({ error: "no permission to access endpoint" });
        }
    };
}
exports.can = can;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const Permission_1 = require("../services/Permission");
class PermissionController {
    async add(request, response) {
        let { name, description } = request.body;
        let execute = await new Permission_1.Permission().addPermission(name, description);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async list(request, response) {
        let execute = await new Permission_1.Permission().getAllPermission();
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.PermissionController = PermissionController;

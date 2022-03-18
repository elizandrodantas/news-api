"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlListController = void 0;
const AccessControllList_1 = require("../services/AccessControllList");
class AccessControlListController {
    async add(request, response) {
        let { user_id, permission_id } = request.body;
        let execute = await new AccessControllList_1.AccessControlList().addPermissionUser(user_id, permission_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async remove(request, response) {
        let { user_id, permission_id } = request.body;
        let execute = await new AccessControllList_1.AccessControlList().removePermissionUser(user_id, permission_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async list(request, response) {
        let { id } = request.params;
        let execute = await new AccessControllList_1.AccessControlList().list(id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.AccessControlListController = AccessControlListController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSafeController = void 0;
const RegisterUser_1 = require("../services/RegisterUser");
const UserSafe_1 = require("../services/UserSafe");
class UserSafeController {
    async list(request, response) {
        let execute = await new UserSafe_1.UserSafe().list();
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async info(request, response) {
        let { id } = request.params;
        let execute = await new UserSafe_1.UserSafe().info(id, request.su);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async register(request, response) {
        let execute = await new RegisterUser_1.RegisterUser().execute(request.body);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async block(request, response) {
        let { id } = request.body;
        let execute = await new UserSafe_1.UserSafe().BlockAndUnlok(id, "block", request.su, request.decoded.client_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async unlock(request, response) {
        let { id } = request.body;
        let execute = await new UserSafe_1.UserSafe().BlockAndUnlok(id, "unlock", request.su, request.decoded.client_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async remove(request, response) {
        let { id } = request.body;
        let execute = await new UserSafe_1.UserSafe().removeUser(id, request.su, request.decoded.client_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async edit(request, response) {
        let { id } = request.body;
        let execute = await new UserSafe_1.UserSafe().edit(id, request.body, request.su);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async createOauth(request, response) {
        let { id } = request.body;
        let execute = await new UserSafe_1.UserSafe().actionOauth(id, "create");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async resetOauth(request, response) {
        let { id } = request.body;
        let execute = await new UserSafe_1.UserSafe().actionOauth(id, "reset");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async removeOauth(request, response) {
        let { id } = request.body;
        let execute = await new UserSafe_1.UserSafe().actionOauth(id, "remove");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async blockOauth(request, response) {
        let { id } = request.params;
        let execute = await new UserSafe_1.UserSafe().actionOauth(id, "block");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async unlockOauth(request, response) {
        let { id } = request.params;
        let execute = await new UserSafe_1.UserSafe().actionOauth(id, "unlock");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.UserSafeController = UserSafeController;

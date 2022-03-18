"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBasicController = void 0;
const UserBasic_1 = require("../services/UserBasic");
class UserBasicController {
    async userInfo(request, response) {
        let { client_id, jti } = request.decoded;
        let execute = await new UserBasic_1.UserBasic().userInfo(client_id, jti);
        if (execute instanceof Error)
            return response.status(401).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async getByUsername(request, response) {
        let { username } = request.params;
        let execute = await new UserBasic_1.UserBasic().getUserByUsername(username);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async lastActive(request, response) {
        let { client_id, jti } = request.decoded;
        let execute = await new UserBasic_1.UserBasic().lastActive(client_id, jti);
        if (execute instanceof Error)
            return response.status(403).json({ error: execute.message });
        return response.status(201).json(execute);
    }
}
exports.UserBasicController = UserBasicController;

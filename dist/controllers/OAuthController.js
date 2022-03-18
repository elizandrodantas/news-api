"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthController = void 0;
const OAuth_1 = require("../services/OAuth");
class OAuthController {
    async deviceSeekRegister(request, response) {
        let { client_id } = request.decoded;
        let execute = await new OAuth_1.OAuth().deivceSeekRegister(client_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async deviceConfirmRegister(request, response) {
        let { client_id } = request.decoded;
        let { code } = request.body;
        let execute = await new OAuth_1.OAuth().deviceConfirmRegister(client_id, code, request);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async deviceList(request, response) {
        let { client_id } = request.decoded;
        let execute = await new OAuth_1.OAuth().deviceList(client_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.OAuthController = OAuthController;

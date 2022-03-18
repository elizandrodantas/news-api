"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmationsController = void 0;
const ReSendConfirmations_1 = require("../services/ReSendConfirmations");
const UserConfirmations_1 = require("../services/UserConfirmations");
class ConfirmationsController {
    async mail(request, response) {
        let { code, id } = request.body;
        let execute = await new UserConfirmations_1.Confirmations().mail(id, code);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async cell(request, response) {
        let { client_id } = request.decoded;
        let { code } = request.body;
        let execute = await new UserConfirmations_1.Confirmations().cell(client_id, code);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async reSendMail(request, response) {
        let { client_id } = request.decoded;
        let execute = await new ReSendConfirmations_1.ReSend().mail(client_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async reSendCell(request, response) {
        let { client_id } = request.decoded;
        let execute = await new ReSendConfirmations_1.ReSend().cell(client_id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.ConfirmationsController = ConfirmationsController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOtpTaskController = void 0;
const GetTaskOtp_1 = require("../services/GetTaskOtp");
class GetOtpTaskController {
    async middler(request, response) {
        let { charge } = request.highPermission;
        let { id } = request.params;
        if (!id)
            return response.status(400).json({ error: "id not defined" });
        if (charge < 10)
            return response.status(403).json({ error: "no permission to access endpoint" });
        let execute = await new GetTaskOtp_1.GetTaskOtp().execute(id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.GetOtpTaskController = GetOtpTaskController;

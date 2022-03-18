"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskOtpController = void 0;
const TaskOtp_1 = require("../services/TaskOtp");
class TaskOtpController {
    async verify(request, response) {
        let { id } = request.params;
        let execute = await new TaskOtp_1.TaskOtp().verify(id);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.TaskOtpController = TaskOtpController;

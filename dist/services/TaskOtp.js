"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskOtp = void 0;
const prisma_1 = require("../database/prisma");
const mask_1 = require("../util/mask");
class TaskOtp {
    async verify(id) {
        if (!id)
            return new Error("id task invalid");
        let task = await prisma_1.Prisma.otp.findUnique({
            where: {
                id
            }
        });
        if (!task)
            return new Error("task not exist");
        task.secret = task.using ? task.secret : undefined;
        task.code = (0, mask_1.hideMaskHalf)(task.code);
        return task;
    }
}
exports.TaskOtp = TaskOtp;

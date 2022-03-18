import { Prisma } from "../database/prisma";
import { hideMaskHalf } from "../util/mask";

export class TaskOtp {
    async verify(id: string){
        if(!id) return new Error("id task invalid");

        let task = await Prisma.otp.findUnique({
            where: {
                id
            }
        });

        if(!task) return new Error("task not exist");

        task.secret = task.using ? task.secret : undefined;
        task.code = hideMaskHalf(task.code);

        return task;
    }
}
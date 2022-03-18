"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = void 0;
const uid2_1 = __importDefault(require("uid2"));
const sms_1 = __importDefault(require("../config/sms"));
const messagebird_1 = __importDefault(require("messagebird"));
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../database/prisma");
let work = (0, messagebird_1.default)("tuN920B7oNWRiqdB8YZxEvD8k");
class sendSms {
    constructor() {
        this.status = false;
        if (!this.taskId)
            this.taskId = (0, uid2_1.default)(32);
    }
    setOrigin(string) {
        return this.originator = string, this;
    }
    setDetails(to, body) {
        return this.to = to, this.body = body, this;
    }
    setDDI(ddi) {
        if (ddi.indexOf('+') !== 0)
            return this;
        return this.ddi = ddi, this;
    }
    async send() {
        if (!this.originator)
            this.originator = sms_1.default.originator;
        if (!this.body || !this.to)
            return new Error("to or body not defined");
        if (!this.ddi)
            this.ddi = sms_1.default.ddi;
        work.messages.create({
            originator: this.originator,
            recipients: [
                this.ddi + this.to
            ],
            body: this.body
        }, (err, suc) => {
            if (err)
                this.response = new Error("error sending sms");
            this.response = suc;
        });
        return this;
    }
    async get() {
        let r = -1;
        for (;;) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            r++;
            if (this.response)
                break;
            if (r > 3)
                break;
        }
        if (!this.response)
            return new Error("time out send sms");
        if (this.response instanceof Error)
            return new Error(this.response.message);
        let { id } = this.response;
        return { id, taskId: this.taskId, sending: (0, moment_1.default)().toISOString() };
    }
    async updatedFinish(taskId, workId) {
        if (workId && taskId) {
            await prisma_1.Prisma.otp.update({
                where: { id: taskId },
                data: {
                    workId
                }
            });
        }
    }
}
exports.sendSms = sendSms;

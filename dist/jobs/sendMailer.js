"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailer = void 0;
const axios_1 = __importDefault(require("axios"));
const base64_1 = require("../util/base64");
const mailjet_1 = __importDefault(require("../config/mailjet"));
const uid2_1 = __importDefault(require("uid2"));
const moment_1 = __importDefault(require("moment"));
class sendMailer {
    constructor() {
        if (!this.taskId)
            this.taskId = (0, uid2_1.default)(32);
    }
    setDetails(to, body) {
        return this.to = to, this.body = body, this;
    }
    setPayload(subject, textPart) {
        return this.subject = subject, this.textPart = textPart, this;
    }
    getSendId() {
        return this.sendId;
    }
    async send() {
        try {
            let send = await (0, axios_1.default)("https://api.mailjet.com/v3.1/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Basic ${(0, base64_1.toBase64)(`${process.env.MAILJET_KEY_ONE}:${process.env.MAILJET_KEY_TWO}`)}`
                },
                data: JSON.stringify({
                    Messages: [
                        {
                            From: {
                                Email: mailjet_1.default.mail.email,
                                Name: mailjet_1.default.mail.name
                            },
                            To: this.to,
                            Subject: this.subject,
                            TextPart: this.textPart,
                            HTMLPart: this.body
                        }
                    ]
                })
            });
            let { data } = send;
            this.response = data;
        }
        catch (_) {
            this.response = new Error("mail not sended");
        }
        return this;
    }
    async get() {
        let r = -1;
        for (;;) {
            r++;
            if (this.response)
                break;
            if (r > 3)
                break;
            await new Promise((resolve) => setInterval(resolve, 1000));
        }
        if (!this.response)
            return new Error("error send mail");
        if (this.response instanceof Error)
            return new Error(this.response.message);
        let id = [];
        try {
            id = this.response.Messages[0].To.map(e => e.MessageID);
        }
        catch (_) { }
        return {
            id: id.join(','),
            taskId: this.taskId,
            sending: (0, moment_1.default)().toISOString()
        };
    }
}
exports.sendMailer = sendMailer;

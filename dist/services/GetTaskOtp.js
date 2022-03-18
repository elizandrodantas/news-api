"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTaskOtp = void 0;
const Otp_1 = require("../database/models/Otp");
class GetTaskOtp {
    async execute(id) {
        if (!id)
            return new Error("tasId not defined");
        let get = await Otp_1.OtpModel.findOne({ id });
        if (!get)
            return new Error("task not found");
        get.secret = undefined;
        return get;
    }
}
exports.GetTaskOtp = GetTaskOtp;

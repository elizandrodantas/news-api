"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishLogin = void 0;
const User_1 = require("../database/models/User");
class finishLogin {
    constructor(sessionId, signature) {
        this.sessionId = sessionId;
        this.signature = signature;
    }
    async finish(id) {
        let update = await User_1.UserModel.findOneAndUpdate({ id }, { $set: {
                sessionId: this.sessionId,
                signature: this.signature
            } }, { new: true });
        if (!update)
            return new Error("user not found");
        update._id = undefined, update.password = undefined, update.updatedAt = undefined, update.signature = undefined;
        this.result = update._doc;
        return this;
    }
    get() { return this.result; }
}
exports.finishLogin = finishLogin;

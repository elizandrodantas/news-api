"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUser = void 0;
const User_1 = require("../database/models/User");
class ListUser {
    async execute() {
        let get = await User_1.UserModel.find({}, {
            password: 0,
            updatedAt: 0
        });
        return this.removeHighCharge(get);
    }
    removeHighCharge(mode) {
        return mode.filter(_ => !_.nivel || _.nivel < 10);
    }
}
exports.ListUser = ListUser;

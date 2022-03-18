"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(roles) {
    return roles.some(i => i && i.scope.split(':')[0] === process.env.SU_ADMIN);
}
exports.default = default_1;

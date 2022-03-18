"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const RegisterUser_1 = require("../services/RegisterUser");
class RegisterController {
    async middler(request, response) {
        let create = await new RegisterUser_1.RegisterUser().execute(request.body);
        if (create instanceof Error || !create)
            return response.status(400).json({ error: create.message || "error create user" });
        return response.status(200).json(create);
    }
    async existUsername(request, response) {
        let { username } = request.params;
        let execute = await new RegisterUser_1.RegisterUser().verifyRegister(username, "user");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(202).json(execute);
    }
    async existEmail(request, response) {
        let { email } = request.params;
        let execute = await new RegisterUser_1.RegisterUser().verifyRegister(email, "mail");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(202).json(execute);
    }
    async existCell(request, response) {
        let { cell } = request.params;
        let execute = await new RegisterUser_1.RegisterUser().verifyRegister(cell, "cellphone");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(202).json(execute);
    }
}
exports.RegisterController = RegisterController;

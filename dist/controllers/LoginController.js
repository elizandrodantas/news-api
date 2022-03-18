"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const SignInUser_1 = require("../services/SignInUser");
class LoginController {
    async init(request, response) {
        let init = await new SignInUser_1.SignIn().init(request, response);
        if (init instanceof Error) {
            try {
                return response.status(JSON.parse(init.message).status)
                    .json({ error: JSON.parse(init.message).message });
            }
            catch (e) {
                return response.status(500).end();
            }
        }
        return response.status(200).send(init);
    }
    async middler(request, response) {
        let { username, password } = request.body;
        let login = await new SignInUser_1.SignIn().execute({ username, password });
        if (login instanceof Error)
            return response.status(401).json({ error: login.message });
        return response.send(login);
    }
    async refreshToken(request, response) {
        let { authorization } = request.headers;
        let execute = await new SignInUser_1.SignIn().refreshToken(authorization);
        if (execute instanceof Error)
            return response.status(401).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.LoginController = LoginController;

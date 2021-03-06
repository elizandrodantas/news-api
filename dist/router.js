"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const router_safe_1 = require("./router.safe");
const ConfirmationController_1 = require("./controllers/ConfirmationController");
const LoginController_1 = require("./controllers/LoginController");
const RegisterController_1 = require("./controllers/RegisterController");
const router_admin_1 = require("./router.admin");
const TaskOtpController_1 = require("./controllers/TaskOtpController");
const UserBasicController_1 = require("./controllers/UserBasicController");
const ensuredAuthenticated_1 = require("./middleware/ensuredAuthenticated");
const router_oauth_1 = require("./router.oauth");
const app = (0, express_1.Router)();
exports.router = app;
app.get('/auth/init', new LoginController_1.LoginController().init);
app.post('/auth', new LoginController_1.LoginController().middler);
app.get('/auth/refresh', new LoginController_1.LoginController().refreshToken);
app.get('/auth/u/:username', new UserBasicController_1.UserBasicController().getByUsername);
app.post('/register', new RegisterController_1.RegisterController().middler);
app.get('/register/user/:username', new RegisterController_1.RegisterController().existUsername);
app.get('/register/email/:email', new RegisterController_1.RegisterController().existEmail);
app.get('/register/cellphone/:cell', new RegisterController_1.RegisterController().existCell);
app.get('/user', [new ensuredAuthenticated_1.ensuredAuthenticated().middler], new UserBasicController_1.UserBasicController().userInfo);
app.get('/active', [new ensuredAuthenticated_1.ensuredAuthenticated().middler], new UserBasicController_1.UserBasicController().lastActive);
app.post('/user/email/c', new ConfirmationController_1.ConfirmationsController().mail);
app.post('/user/cell/c', new ensuredAuthenticated_1.ensuredAuthenticated().middler, new ConfirmationController_1.ConfirmationsController().cell);
app.get('/user/email/send', new ensuredAuthenticated_1.ensuredAuthenticated().middler, new ConfirmationController_1.ConfirmationsController().reSendMail);
app.get('/user/cell/send/', new ensuredAuthenticated_1.ensuredAuthenticated().middler, new ConfirmationController_1.ConfirmationsController().reSendCell);
app.get('/otp/verify-task/:id', new TaskOtpController_1.TaskOtpController().verify);
app.use('/admin', router_admin_1.routerAdmin);
app.use('/api', router_safe_1.routerSafe);
app.use('/oauth', router_oauth_1.routerOauth);

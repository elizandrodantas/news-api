"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerOauth = void 0;
const express_1 = require("express");
const OAuthController_1 = require("./controllers/OAuthController");
const ensuredAuthenticated_1 = require("./middleware/ensuredAuthenticated");
const app = (0, express_1.Router)();
exports.routerOauth = app;
app.get('/device/register', [new ensuredAuthenticated_1.ensuredAuthenticated().middler], new OAuthController_1.OAuthController().deviceSeekRegister);
app.post('/device/register', [new ensuredAuthenticated_1.ensuredAuthenticated().middler], new OAuthController_1.OAuthController().deviceConfirmRegister);
app.get('/device/list', [new ensuredAuthenticated_1.ensuredAuthenticated().middler], new OAuthController_1.OAuthController().deviceList);

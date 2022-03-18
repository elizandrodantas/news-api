"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const app_1 = __importDefault(require("./config/app"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
(0, dotenv_1.config)();
const router_1 = require("./router");
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"]
}));
app.use('/v1', router_1.router);
app.use((request, response, next) => {
    response.status(404).json({ error: "router not found", time: Date.now(), ip: request.ip });
});
app.listen(app_1.default.port[app_1.default.__DEV__ ? "dev" : "prod"] || 3333, () => { console.log(`START PORT ${app_1.default.port[app_1.default.__DEV__ ? "dev" : "prod"] || 3333}`); });

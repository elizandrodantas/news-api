import express, { NextFunction, Request, Response } from 'express';
import { config } from 'dotenv';
import conf from './config/app';
import cors from 'cors';

const app = express();
config();

import { router } from "./router";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"]
}));

app.use('/v1', router);

app.use((err: any,request: Request, response: Response, next: NextFunction) => {
    if(err) return response.status(406).json({error: "invalid request, try again"})
    return response.status(404).json({ error: "router not found", time: Date.now(), ip: request.ip });
});

app.listen(conf.port[conf.__DEV__ ? "dev" : "prod"] || 3333, () => { console.log(`START PORT ${conf.port[conf.__DEV__ ? "dev" : "prod"] || 3333}`) });
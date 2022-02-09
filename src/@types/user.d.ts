import { ObjectId } from "mongoose";

declare interface iSchemaUserModel {
    _id: ObjectId;
    id: string;
    name: string;
    username: string;
    password: string;
    fullname: [string, string];
    lastname: string;
    active: boolean;
    sessionId: string;
    signature: string;
    createdAt: Date;
    updatedAt: Date;
    photo: string;
    mailConfirmated: boolean;
    cellConfirmated: boolean;
    taskMailSend: string;
    email: string;
    cell: string;
}
import { iSchemaUserModel } from "./user";

declare type iCreateUserPayload = {
    username: string;
    password: string;
    name?: string;
    cell: string;
    email: string;
    lastname: string;
}
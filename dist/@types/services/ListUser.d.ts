import { iSchemaUserModel } from "../@types/user";
export declare class ListUser {
    execute(): Promise<iSchemaUserModel[]>;
    removeHighCharge(mode: iSchemaUserModel[]): iSchemaUserModel[];
}

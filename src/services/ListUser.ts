import { iSchemaUserModel } from "../@types/user";
import { UserModel } from "../database/models/User";

export class ListUser {
    async execute(): Promise<iSchemaUserModel[]>{
        let get = await UserModel.find({}, {
            password: 0,
            updatedAt: 0
        });

        return this.removeHighCharge(get);
    }

    removeHighCharge(mode: iSchemaUserModel[]): iSchemaUserModel[]{
        return mode.filter(_ => !_.nivel || _.nivel < 10)
    }
}
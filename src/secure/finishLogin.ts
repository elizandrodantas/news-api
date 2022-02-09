import { iSchemaUserModel } from "../@types/user";
import { UserModel } from "../database/models/User";

export class finishLogin {
    result: iSchemaUserModel;

    constructor(
        public sessionId: string,
        public signature: string
    ){}

    async finish(id: string){
        let update: any = await UserModel.findOneAndUpdate({id}, {$set: {
            sessionId: this.sessionId,
            signature: this.signature
        }}, {new: true});

        if(!update) return new Error("user not found");
        
        update._id = undefined, update.password = undefined, update.updatedAt = undefined, update.signature = undefined;

        this.result = update._doc;

        return this;
    }

    get(){ return this.result }
}
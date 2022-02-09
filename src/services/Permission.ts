import { Permission as iPermission } from "@prisma/client";
import { Prisma } from "../database/prisma";

export class Permission {
    async addPermission(name: string, description: string){
        if(!name || !description) return new Error("name or description invalid");

        let verifyExist = await this.getPermissionByName(name);
        if(!(verifyExist instanceof Error)) return new Error("permission already registered");

        let create = await Prisma.permission.create({
            data: {
                name,
                description
            }
        });

        if(create instanceof Error) return new Error("error create permission");

        return create;
    }

    async getPermissionByName(name: string): Promise<Error | iPermission>{
        if(!name) return new Error("name not defined");

        let get = await Prisma.permission.findFirst({
            where: {
                name
            }
        });

        if(!get) return new Error("permission not exist");

        return get;
    }

    async getAllPermission(): Promise<Error | iPermission[]>{
        let get = await Prisma.permission.findMany();

        if(get instanceof Error) return new Error("error get all permission");

        return get;
    }
}
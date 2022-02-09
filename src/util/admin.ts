import { PermissionRoles } from "@prisma/client";

export default function(roles: PermissionRoles[]){
    return roles.some(i => i && i.scope.split(':')[0] === process.env.SU_ADMIN);
}
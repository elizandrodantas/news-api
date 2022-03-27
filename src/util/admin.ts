import { PermissionRoles } from "@prisma/client";

export function admin(roles: PermissionRoles[]){
    return roles.some(i => i && i.scope.split(':')[0] === process.env.SU_ADMIN);
}

export function moderator(roles: PermissionRoles[]){
    return roles.some(i => i && i.scope.split(':')[0] === process.env.MO_ADMIN);
}
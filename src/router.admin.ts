import { Router } from 'express';
import { AccessControlListController } from './controllers/AccessControlListController';
import { PermissionController } from './controllers/PermissionController';
import { UserSafeController } from './controllers/UserSafeController';
import { ensuredAuthenticated } from './middleware/ensuredAuthenticated';
import { can } from './middleware/permission';

const app = Router();

app.use([new ensuredAuthenticated().middler]);

//  ACL ( ACCESS CONTROL LIST )
app.post('/acl/add/user', can(["acl", "admin"]), new AccessControlListController().add);
app.delete('/acl/remove/user', can(["acl", "admin"]), new AccessControlListController().remove);
app.get('/acl/list/user/:id', can(["acl", "admin"]), new AccessControlListController().list);

//  PERMISSION
app.post('/permission/add', can(["permission", "admin"]), new PermissionController().add);
app.get('/permission/list', can(["permission", "admin"]), new PermissionController().list);

//  USER
app.get('/user/list', can(["admin", "moderator"]), new UserSafeController().list);
app.get('/user/:id', can(["admin", "moderator"]), new UserSafeController().info);
app.post('/user/add', can(["admin", "moderator"]), new UserSafeController().register);
app.put('/user/block', can(["admin", "moderator"]), new UserSafeController().block);
app.put('/user/unlock', can(["admin", "moderator"]), new UserSafeController().unlock);
app.put('/user/edit', can(["admin", "moderator"]), new UserSafeController().edit);
app.delete('/user/remove', can(["admin"]), new UserSafeController().remove);
app.post('/user/basic-auth/create', can(["admin", "moderator"]), new UserSafeController().createAuth);


export { app as routerAdmin }
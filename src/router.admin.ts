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
app.post('/permission/add', new PermissionController().add);
app.get('/permission/list', new PermissionController().list);

// OAUTH
app.post('/oauth/create', new UserSafeController().createOauth);
app.put('/oauth/reset', new UserSafeController().resetOauth);
app.delete('/oauth/remove', new UserSafeController().removeOauth);
app.get('/oauth/block/:id', new UserSafeController().blockOauth);
app.get('/oauth/unlock/:id', new UserSafeController().unlockOauth);

//  USER
app.get('/user/list', can(["admin", "moderator"]), new UserSafeController().list);
app.get('/user/:id', can(["admin", "moderator"]), new UserSafeController().info);
app.post('/user/add', can(["admin", "moderator"]), new UserSafeController().register);
app.put('/user/block', can(["admin", "moderator"]), new UserSafeController().block);
app.put('/user/unlock', can(["admin", "moderator"]), new UserSafeController().unlock);
app.put('/user/edit', can(["admin", "moderator"]), new UserSafeController().edit);
app.delete('/user/remove', can(["admin"]), new UserSafeController().remove);


export { app as routerAdmin }
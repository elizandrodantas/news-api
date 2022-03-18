import { Router } from "express";
import { routerSafe } from "./router.safe";

import { ConfirmationsController } from "./controllers/ConfirmationController";
import { LoginController } from "./controllers/LoginController";
import { RegisterController } from "./controllers/RegisterController";
import { routerAdmin } from "./router.admin";
import { TaskOtpController } from "./controllers/TaskOtpController";
import { UserBasicController } from "./controllers/UserBasicController";
import { ensuredAuthenticated } from "./middleware/ensuredAuthenticated";
import { routerOauth } from "./router.oauth";

const app = Router();

// SIGN AND REGISTER ROUTER
app.get('/auth/init', new LoginController().init);
app.post('/auth', new LoginController().middler);
app.get('/auth/refresh', new LoginController().refreshToken);
app.get('/auth/u/:username', new UserBasicController().getByUsername);
app.post('/register', new RegisterController().middler);
app.get('/register/user/:username', new RegisterController().existUsername);
app.get('/register/email/:email', new RegisterController().existEmail);
app.get('/register/cellphone/:cell', new RegisterController().existCell);

// ROUTER USER
app.get('/user', [new ensuredAuthenticated().middler], new UserBasicController().userInfo);
app.get('/active', [new ensuredAuthenticated().middler], new UserBasicController().lastActive)
app.post('/user/email/c', new ConfirmationsController().mail);
app.post('/user/cell/c', new ensuredAuthenticated().middler, new ConfirmationsController().cell);
app.get('/user/email/send', new ensuredAuthenticated().middler, new ConfirmationsController().reSendMail);
app.get('/user/cell/send/', new ensuredAuthenticated().middler, new ConfirmationsController().reSendCell);

// ROUTER OTP
app.get('/otp/verify-task/:id', new TaskOtpController().verify);

/* 
ROUTER API
*/

app.use('/admin', routerAdmin);
app.use('/api', routerSafe);
app.use('/oauth', routerOauth);

export {
    app as router
}
import { Router } from "express";
import { OAuthController } from "./controllers/OAuthController";
import { UserSafeController } from "./controllers/UserSafeController";
import { ensuredAuthenticated } from "./middleware/ensuredAuthenticated";

const app = Router();

// app.use([new ensuredAuthenticated().middler]);

app.get('/device/register', [new ensuredAuthenticated().middler], new OAuthController().deviceSeekRegister);
app.post('/device/register', [new ensuredAuthenticated().middler], new OAuthController().deviceConfirmRegister);
app.get('/device/list', [new ensuredAuthenticated().middler], new OAuthController().deviceList);

export { app as routerOauth }
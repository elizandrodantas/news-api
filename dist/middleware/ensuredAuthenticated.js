"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensuredAuthenticated = void 0;
const DeviceAuth_1 = require("../jobs/DeviceAuth");
const JsonWebToken_1 = require("../jobs/JsonWebToken");
class ensuredAuthenticated {
    async middler(request, response, next) {
        let { authorization } = request.headers;
        if (!authorization)
            return response.status(401).json({ error: "session invalid" });
        if (authorization.indexOf("Bearer") === 0) {
            let verifyEnsured = await new JsonWebToken_1.JsonWebToken().verify({ bearer: authorization, type: "token" });
            if (verifyEnsured instanceof Error)
                return response.status(401).json({ error: verifyEnsured.message });
            let { client_id, jti } = verifyEnsured;
            let verifySession = await new JsonWebToken_1.JsonWebToken().sessionVerify(client_id, jti);
            if (verifySession instanceof Error)
                return response.status(401).json({ error: verifySession.message });
            request.decoded = verifyEnsured;
            return next();
        }
        if (authorization.indexOf("Basic") === 0) {
            let controllerDevice = new DeviceAuth_1.DeviceAuth(), devicePrepare = controllerDevice.prepare(request);
            if (devicePrepare instanceof Error)
                return response.status(480).json({ error: devicePrepare.message });
            let verifyDevice = controllerDevice.verifyDevice();
            if (verifyDevice instanceof Error)
                return response.status(480).json({ error: verifyDevice.message });
            let verifyGross = controllerDevice.verifyGross();
            if (verifyGross instanceof Error)
                return response.status(480).json({ error: verifyGross.message });
            let verifyCredentials = await controllerDevice.verifyCredentials();
            console.log(verifyCredentials);
            return response.send(authorization);
        }
        return response.status(401).json({ error: "not authorized" });
    }
}
exports.ensuredAuthenticated = ensuredAuthenticated;

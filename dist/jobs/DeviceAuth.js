"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceAuth = void 0;
const Forge_1 = require("../core/Forge");
const node_forge_1 = require("node-forge");
const prisma_1 = require("../database/prisma");
const uuid_1 = require("uuid");
class DeviceAuth {
    constructor() {
        this.controller = new Forge_1.ForgeSecure();
    }
    prepare(request) {
        let { headers } = request, { authorization } = headers, device_name = headers["x-device-name"], device_id = headers["x-device-id"], pem = headers["x-device-asigned"], gross = headers['gross-identifier'];
        if (!authorization || !device_id || !device_name || !pem || !gross)
            return new Error("request invalid");
        this.signedCert = pem, this.gross = gross, this.device = { device_id, device_name }, this.credentials = authorization;
        return this;
    }
    verifyGross() {
        if (!this.signedCert)
            return new Error("asigned not found");
        if (!this.gross)
            return new Error("gross-identifier not found");
        this.controller.setSignedCertBase64(this.signedCert);
        if (!this.controller.validateGross(this.gross))
            return new Error("gross identifier not assigned");
        return {
            gross: this.gross
        };
    }
    verifyDevice() {
        if (!this.signedCert)
            return new Error("asigned not found");
        if (!this.device)
            return new Error("device invalid");
        this.controller.setSignedCertBase64(this.signedCert);
        this.controller.setDevice(this.device);
        if (!this.controller.validateDevice())
            return new Error("device not verificate");
        return {
            device: this.device
        };
    }
    async verifyCredentials() {
        if (!this.credentials)
            return new Error("not authorization");
        if (this.credentials.indexOf("Basic") !== 0)
            return new Error("OAuth credentials invalid");
        try {
            this.credentials = this.credentials.split(' ')[1];
            this.credentials = node_forge_1.util.decode64(this.credentials);
        }
        catch (e) {
            return new Error("credentials invalid");
        }
        let [client_id, secret_id] = this.credentials.split(':');
        if (!(0, uuid_1.validate)(client_id) || !(0, uuid_1.validate)(secret_id))
            return new Error("credentials invalid");
        let getUserRelationDevice = await prisma_1.Prisma.user.findFirst({
            where: { clientId: client_id, secretId: secret_id }
        });
        if (!getUserRelationDevice)
            return new Error("unauthorization");
        let { id: userId, active, mailConfirmated, OAuth } = getUserRelationDevice;
        this.userId = userId;
        this.userInfo = getUserRelationDevice;
        if (!active)
            return new Error("user blocked");
        if (!mailConfirmated)
            return new Error("email not confirmed");
        if (!OAuth)
            return new Error("OAuth desabled");
        let deviceRelationRegister = await prisma_1.Prisma.deviceRegister.findMany({
            where: { userId }
        });
        console.log(deviceRelationRegister);
        let deviceFilter = deviceRelationRegister.filter((element) => {
            let { signed_cert_base64, device_id: dId, device_name: dName } = element, { device_id, device_name } = this.device;
            return signed_cert_base64 === this.signedCert || dId === device_id && dName === device_name;
        });
        if (deviceFilter.length <= 0)
            return new Error("non-aggregated device");
        return deviceFilter;
    }
    async verifyDeviceRegister() {
        if (!this.userId)
            return new Error("user not identifier");
        if (!this.gross || !this.signedCert)
            return new Error("device not register");
        let getGrossRegister = await prisma_1.Prisma.deviceRegister.findFirst({
            where: { userId: this.userId, signed_cert_base64: this.signedCert }
        });
        if (!getGrossRegister)
            return new Error("gross-identifier not aggreged");
        return this.aggregedGross = getGrossRegister, this.aggregedGross;
    }
}
exports.DeviceAuth = DeviceAuth;

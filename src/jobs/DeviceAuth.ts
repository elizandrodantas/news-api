import { Request } from "express";
import { ForgeSecure } from "../core/Forge";
import { util } from 'node-forge';
import { Prisma } from '../database/prisma';
import { validate as uuidValidate} from 'uuid';
import { DeviceRegister, User } from "@prisma/client";

type iDevice = {
    device_id: string;
    device_name: string;
}

export class DeviceAuth {
    private controller: ForgeSecure = new ForgeSecure();
    private signedCert: string;
    private gross: string;
    private device: iDevice;
    private credentials: string;
    private userId: string;
    private userInfo: User;
    private aggregedGross: DeviceRegister

    prepare(request: Request): this | Error{
        let { headers } = request,
        { authorization } = headers,
        device_name = headers["x-device-name"] as string,
        device_id = headers["x-device-id"] as string,
        pem = headers["x-device-asigned"] as string,
        gross = headers['gross-identifier'] as string;

        if(!authorization || !device_id || !device_name || !pem || !gross) return new Error("request invalid");
    
        this.signedCert = pem, this.gross = gross, this.device = { device_id, device_name }, this.credentials = authorization;

        return this;
    }

    verifyGross(){
        if(!this.signedCert) return new Error("asigned not found");
        if(!this.gross) return new Error("gross-identifier not found");

        this.controller.setSignedCertBase64(this.signedCert);

        if(!this.controller.validateGross(this.gross)) return new Error("gross identifier not assigned");

        return {
            gross: this.gross
        }
    }

    verifyDevice(){
        if(!this.signedCert) return new Error("asigned not found");
        if(!this.device) return new Error("device invalid");

        this.controller.setSignedCertBase64(this.signedCert);
        this.controller.setDevice(this.device);

        if(!this.controller.validateDevice()) return new Error("device not verificate");

        return {
            device: this.device
        }
    }

    async verifyCredentials(){
        if(!this.credentials) return new Error("not authorization");

        if(this.credentials.indexOf("Basic") !== 0) return new Error("OAuth credentials invalid");

        try{
            this.credentials = this.credentials.split(' ')[1];
            this.credentials = util.decode64(this.credentials);
        }catch(e){return new Error("credentials invalid")}

        let [ client_id, secret_id ] = this.credentials.split(':');

        if(!uuidValidate(client_id) || !uuidValidate(secret_id)) return new Error("credentials invalid");

        let getUserRelationDevice = await Prisma.user.findFirst({
            where: { clientId: client_id, secretId: secret_id }
        });

        if(!getUserRelationDevice) return new Error("unauthorization");

        let { id: userId, active, mailConfirmated, OAuth } = getUserRelationDevice;
        this.userId = userId; this.userInfo = getUserRelationDevice;

        if(!active) return new Error("user blocked");
        if(!mailConfirmated) return new Error("email not confirmed");
        if(!OAuth) return new Error("OAuth desabled");

        let deviceRelationRegister = await Prisma.deviceRegister.findMany({
            where: { userId }
        });

        console.log(deviceRelationRegister)

        let deviceFilter = deviceRelationRegister.filter((element: DeviceRegister) => {
            let { signed_cert_base64, device_id: dId, device_name: dName } = element, { device_id, device_name } = this.device;

            return signed_cert_base64 === this.signedCert || dId === device_id && dName === device_name;
        });

        if(deviceFilter.length <= 0) return new Error("non-aggregated device");
        

        return deviceFilter
    }

    async verifyDeviceRegister(){
        if(!this.userId) return new Error("user not identifier");
        if(!this.gross || !this.signedCert) return new Error("device not register");

        let getGrossRegister = await Prisma.deviceRegister.findFirst({
            where: { userId: this.userId, signed_cert_base64: this.signedCert }
        });

        if(!getGrossRegister) return new Error("gross-identifier not aggreged");

        return this.aggregedGross = getGrossRegister, this.aggregedGross;
    }
}
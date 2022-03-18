"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeSecure = void 0;
const moment_1 = __importDefault(require("moment"));
const node_forge_1 = __importDefault(require("node-forge"));
const app_1 = __importDefault(require("../config/app"));
class ForgeSecure {
    constructor() {
        this.certDN = [];
    }
    setSignedCertBase64(arg) {
        return this.signedCertBase64 = arg, this;
    }
    getSignedCertBase64() {
        return this.signedCertBase64;
    }
    setCsrBase64(arg) {
        return this.csrBase64 = arg, this;
    }
    getCsrBase64() {
        return this.csrBase64;
    }
    setGross(arg) {
        return this.gross = arg, this;
    }
    getGross() {
        return this.gross;
    }
    setDevice(arg) {
        return this.device = arg, this;
    }
    getDevice() {
        return this.device;
    }
    setCertDN(props) {
        if (!props || typeof props !== "object")
            return this;
        let { device_id, device_name, userId } = props;
        this.certDN.push({
            type: '2.5.4.10',
            value: app_1.default.ORGANIZATION_NAME,
            valueTagClass: 12,
            name: 'organizationName',
            shortName: 'O'
        });
        device_name ? this.certDN.push({
            type: '0.9.2342.19200300.100.1.25',
            value: device_name,
            valueTagClass: 22
        }) : false;
        device_id ? this.certDN.push({
            type: '2.5.4.11',
            value: device_id,
            valueTagClass: 12,
            name: 'organizationalUnitName',
            shortName: 'OU'
        }) : false;
        userId ? this.certDN.push({
            type: '2.5.4.3',
            value: userId,
            valueTagClass: 12,
            name: 'commonName',
            shortName: 'CN'
        }) : false;
        userId ? this.userId = userId : false;
        return this;
    }
    setCertDNPush(props) {
        if (!props || typeof props !== "object")
            return this;
        return this.certDN.push(props), this;
    }
    getuserId() {
        return this.userId;
    }
    setuserId(arg) {
        return this.userId = arg, this;
    }
    getCertDN() {
        return this.certDN;
    }
    createCertificate() {
        let keys = node_forge_1.default.pki.rsa.generateKeyPair(2048), csr = node_forge_1.default.pki.createCertificationRequest();
        csr.publicKey = keys.publicKey;
        if (!this.certDN || typeof this.certDN !== "object")
            return new Error("Certificate Distinguished Name invalid");
        try {
            csr.setSubject(this.certDN);
            csr.sign(keys.privateKey);
            var csrPem = node_forge_1.default.pki.certificationRequestToPem(csr);
            var der = node_forge_1.default.pki.pemToDer(csrPem);
            this.signedCertBase64 = node_forge_1.default.util.encode64(der.getBytes());
            this.csrBase64 = csrPem;
        }
        catch (e) {
            return new Error("error create certificate");
        }
        return this;
    }
    getCreateCertificateData() {
        return {
            signed_cert_base64: this.signedCertBase64,
            csr_base64: this.csrBase64,
            userId: this.userId,
            cert_dn: this.certDN,
            gross: this.gross
        };
    }
    generateGross() {
        if (!this.csrBase64)
            return null;
        try {
            let csrBytes = node_forge_1.default.pki.pemToDer(this.csrBase64).getBytes(), sha1 = node_forge_1.default.md.sha1.create();
            sha1.update(csrBytes, 'raw');
            return this.gross = node_forge_1.default.util.encode64(sha1.digest().getBytes()), this.gross;
        }
        catch (e) {
            return e;
        }
    }
    validateGross(gross) {
        if (!gross || !this.signedCertBase64)
            return false;
        let derFormated = this.formatedSignedCertBase64();
        if (!derFormated)
            return false;
        this.csrBase64 = derFormated;
        this.generateGross();
        if (this.gross !== gross)
            return false;
        return true;
    }
    validateDevice(options) {
        if (!this.signedCertBase64 || !this.device)
            return false;
        let derFormated = this.formatedSignedCertBase64();
        if (!derFormated)
            return false;
        this.csrBase64 = derFormated;
        let subjects = this.getSubject();
        if (!subjects)
            return false;
        let { device_id, device_name } = this.device, err = false;
        for (let i of subjects) {
            if (!i.name) {
                if (i.value !== device_name)
                    err = true;
            }
            if (i.name === "organizationalUnitName") {
                if (i.value !== device_id)
                    err = true;
            }
            if (i.name === "organizationName") {
                if (i.value !== app_1.default.ORGANIZATION_NAME)
                    err = true;
            }
            if (options && options.userId && i.name === "commonName") {
                if (i.value !== this.userId || !this.userId)
                    err = true;
            }
        }
        ;
        if (err)
            return false;
        return true;
    }
    getSubject(attr) {
        try {
            if (!this.csrBase64)
                return null;
            let csr = node_forge_1.default.pki.certificationRequestFromPem(this.csrBase64);
            if (attr && typeof attr === "object") {
                return csr.subject.getField(attr);
            }
            return csr.subject.attributes;
        }
        catch (e) {
            return null;
        }
    }
    ArrayToString(arr) {
        try {
            return JSON.stringify(arr);
        }
        catch (e) {
            return "";
        }
    }
    getGranceExpired() {
        return (0, moment_1.default)().add(2, 'm').unix();
    }
    formatedSignedCertBase64() {
        if (!this.signedCertBase64)
            return "";
        try {
            let prefixo = '-----BEGIN CERTIFICATE REQUEST-----\n', sufixo = '-----END CERTIFICATE REQUEST-----', pemText = prefixo + this.signedCertBase64.match(/.{0,64}/g).join('\n') + sufixo;
            return pemText;
        }
        catch (e) {
            return "";
        }
    }
}
exports.ForgeSecure = ForgeSecure;

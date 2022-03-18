import moment from 'moment';
import forge from 'node-forge';
import config from '../config/app';

type iOptionsValidateDevice = {
    userId?: boolean;
}

type iSetDN = {
    device_name?: string;
    device_id?: string;
    userId?: string;
}

type iResponseGetDataCreate = {
    signed_cert_base64: string;
    csr_base64: string;
    userId: string;
    cert_dn: forge.pki.CertificateField[];
    gross: string;
}

type iDevice = {
    device_id: string;
    device_name: string;
}

export class ForgeSecure {
    private signedCertBase64: string;
    private csrBase64: string;
    private certDN: forge.pki.CertificateField[] = [];
    private userId: string;
    private gross: string;
    private device: iDevice;

    setSignedCertBase64(arg: string): this{
        return this.signedCertBase64 = arg, this;
    }

    getSignedCertBase64(): string {
        return this.signedCertBase64;
    }

    setCsrBase64(arg: string): this{
        return this.csrBase64 = arg, this;
    }

    getCsrBase64(): string{
        return this.csrBase64;
    }

    setGross(arg: string): this{
        return this.gross = arg, this;
    }

    getGross(): string {
        return this.gross;
    }

    setDevice(arg: iDevice): this{
        return this.device = arg, this;
    }

    getDevice(): iDevice{
        return this.device;
    }

    setCertDN(props: iSetDN): this{
        if(!props || typeof props !== "object") return this;

        let { device_id, device_name, userId } = props;

        this.certDN.push({
            type: '2.5.4.10',
            value: config.ORGANIZATION_NAME,
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

    setCertDNPush(props: forge.pki.CertificateField): this{
        if(!props || typeof props !== "object") return this;

        return this.certDN.push(props), this;
    }

    getuserId(): string {
        return this.userId;
    }

    setuserId(arg: string): this {
        return this.userId = arg, this;
    }

    getCertDN(): forge.pki.CertificateField[]{
        return this.certDN;
    }

    createCertificate(): Error | this{
        let keys = forge.pki.rsa.generateKeyPair(2048), csr = forge.pki.createCertificationRequest();
        csr.publicKey = keys.publicKey;

        if(!this.certDN || typeof this.certDN !== "object") return new Error("Certificate Distinguished Name invalid");
        
        try{
            csr.setSubject(this.certDN);
            csr.sign(keys.privateKey);
            var csrPem = forge.pki.certificationRequestToPem(csr);
            var der = forge.pki.pemToDer(csrPem)
            this.signedCertBase64 = forge.util.encode64(der.getBytes());
            this.csrBase64 = csrPem;
        }catch(e){ return new Error("error create certificate"); }

        return this;
    }
    
    getCreateCertificateData(): iResponseGetDataCreate{
        return {
            signed_cert_base64: this.signedCertBase64,
            csr_base64: this.csrBase64,
            userId: this.userId,
            cert_dn: this.certDN,
            gross: this.gross
        }
    }

    generateGross(): string | null{
        if(!this.csrBase64) return null;

        try{
            let csrBytes = forge.pki.pemToDer(this.csrBase64).getBytes(), sha1 = forge.md.sha1.create();

            sha1.update(csrBytes, 'raw');

            return this.gross = forge.util.encode64(sha1.digest().getBytes()), this.gross;
        }catch(e){return e}
    }

    validateGross(gross: string): boolean{
        if(!gross || !this.signedCertBase64) return false;

        let derFormated = this.formatedSignedCertBase64();
        if(!derFormated) return false;
        this.csrBase64 = derFormated;
        this.generateGross();
        if(this.gross !== gross) return false;

        return true;
    }

    validateDevice(options?: iOptionsValidateDevice): boolean{
        if(!this.signedCertBase64 || !this.device) return false;

        let derFormated = this.formatedSignedCertBase64();
        if(!derFormated) return false;
        this.csrBase64 = derFormated;
        let subjects = this.getSubject();
        if(!subjects) return false;

        let { device_id, device_name } = this.device, err: boolean = false;

        for(let i of subjects){
            if(!i.name){
                if(i.value !== device_name) err = true;
            }

            if(i.name === "organizationalUnitName"){
                if(i.value !== device_id) err = true;
            }

            if(i.name === "organizationName"){
                if(i.value !== config.ORGANIZATION_NAME) err = true;
            }
            if(options && options.userId && i.name === "commonName"){
                if(i.value !== this.userId || !this.userId) err = true;
            }
        };

        if(err) return false;

        return true;
    }

    getSubject(attr?: forge.pki.CertificateField): forge.pki.CertificateField[] | null {
        try{
            if(!this.csrBase64) return null;

            let csr = forge.pki.certificationRequestFromPem(this.csrBase64);

            if(attr && typeof attr === "object"){
                return csr.subject.getField(attr);
            }
    
            return csr.subject.attributes;
        }catch(e){return null}
    }

    ArrayToString(arr: any[]): string{
        try{
            return JSON.stringify(arr);
        }catch(e){return ""}
    }

    getGranceExpired(): number{
        return moment().add(2, 'm').unix();
    }

    private formatedSignedCertBase64(): string{
        if(!this.signedCertBase64) return "";

        try{
            let prefixo = '-----BEGIN CERTIFICATE REQUEST-----\n', sufixo = '-----END CERTIFICATE REQUEST-----',
            pemText = prefixo + this.signedCertBase64.match(/.{0,64}/g).join('\n') + sufixo;

            return pemText
        }catch(e){return ""}
    }
}
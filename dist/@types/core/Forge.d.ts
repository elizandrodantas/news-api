import forge from 'node-forge';
declare type iOptionsValidateDevice = {
    userId?: boolean;
};
declare type iSetDN = {
    device_name?: string;
    device_id?: string;
    userId?: string;
};
declare type iResponseGetDataCreate = {
    signed_cert_base64: string;
    csr_base64: string;
    userId: string;
    cert_dn: forge.pki.CertificateField[];
    gross: string;
};
declare type iDevice = {
    device_id: string;
    device_name: string;
};
export declare class ForgeSecure {
    private signedCertBase64;
    private csrBase64;
    private certDN;
    private userId;
    private gross;
    private device;
    setSignedCertBase64(arg: string): this;
    getSignedCertBase64(): string;
    setCsrBase64(arg: string): this;
    getCsrBase64(): string;
    setGross(arg: string): this;
    getGross(): string;
    setDevice(arg: iDevice): this;
    getDevice(): iDevice;
    setCertDN(props: iSetDN): this;
    setCertDNPush(props: forge.pki.CertificateField): this;
    getuserId(): string;
    setuserId(arg: string): this;
    getCertDN(): forge.pki.CertificateField[];
    createCertificate(): Error | this;
    getCreateCertificateData(): iResponseGetDataCreate;
    generateGross(): string | null;
    validateGross(gross: string): boolean;
    validateDevice(options?: iOptionsValidateDevice): boolean;
    getSubject(attr?: forge.pki.CertificateField): forge.pki.CertificateField[] | null;
    ArrayToString(arr: any[]): string;
    getGranceExpired(): number;
    private formatedSignedCertBase64;
}
export {};

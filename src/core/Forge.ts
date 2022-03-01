import forge from 'node-forge';

type iCreateRequestCertificate = {
    username?: string;
    device_name: string;
    device_id: string;
}

export class ForgeSecure {
    createRequestCertificate({username, device_name, device_id}: iCreateRequestCertificate){
        let keys = forge.pki.rsa.generateKeyPair(2048);
        let csr = forge.pki.createCertificationRequest();
        csr.publicKey = keys.publicKey;

        let subject = [];

        subject.push({
            type: '2.5.4.10',
            value: 'Elizandro Technology',
            valueTagClass: 12,
            name: 'organizationName',
            shortName: 'O'
        });

        device_name ? subject.push({
            type: '0.9.2342.19200300.100.1.25',
            value: device_name,
            valueTagClass: 22
        }) : false;

        device_id ? subject.push({
            type: '2.5.4.11',
            value: device_id,
            valueTagClass: 12,
            name: 'organizationalUnitName',
            shortName: 'OU'
        }) : false;

        username ? subject.push({
            type: '2.5.4.3',
            value: username,
            valueTagClass: 12,
            name: 'commonName',
            shortName: 'CN'
        }) : false;

        csr.setSubject(subject);
        csr.sign(keys.privateKey);
        var csrPem = forge.pki.certificationRequestToPem(csr);
        var der = forge.pki.pemToDer(csrPem)
        return forge.util.encode64(der.getBytes());
    }

    
}
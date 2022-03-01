const { pki, util } = require('node-forge');
var keys = pki.rsa.generateKeyPair(2048);
var cert = pki.createCertificate();
cert.publicKey = keys.publicKey;
// alternatively set public key from a csr
//cert.publicKey = csr.publicKey;
// NOTE: serialNumber is the hex encoded value of an ASN.1 INTEGER.
// Conforming CAs should ensure serialNumber is:
// - no more than 20 octets
// - non-negative (prefix a '00' if your value starts with a '1' bit)

var attrs = [{
  name: 'commonName',
  value: 'example.org'
}, {
  name: 'countryName',
  value: 'US'
}, {
  shortName: 'ST',
  value: 'Virginia'
}, {
  name: 'localityName',
  value: 'Blacksburg'
}, {
  name: 'organizationName',
  value: 'Test'
}, {
  shortName: 'OU',
  value: 'Test'
}];
cert.setSubject(attrs);
// alternatively set subject from a csr
//cert.setSubject(csr.subject.attributes);
// cert.setIssuer(attrs);
// cert.setExtensions([{
//   name: 'basicConstraints',
//   cA: true
// }, {
//   name: 'keyUsage',
//   keyCertSign: true,
//   digitalSignature: true,
//   nonRepudiation: true,
//   keyEncipherment: true,
//   dataEncipherment: true
// }, {
//   name: 'extKeyUsage',
//   serverAuth: true,
//   clientAuth: true,
//   codeSigning: true,
//   emailProtection: true,
//   timeStamping: true
// }, {
//   name: 'nsCertType',
//   client: true,
//   server: true,
//   email: true,
//   objsign: true,
//   sslCA: true,
//   emailCA: true,
//   objCA: true
// }, {
//   name: 'subjectAltName',
//   altNames: [{
//     type: 6, // URI
//     value: 'http://example.org/webid#me'
//   }, {
//     type: 7, // IP
//     ip: '127.0.0.1'
//   }]
// }, {
//   name: 'subjectKeyIdentifier'
// }]);
/* alternatively set extensions from a csr
var extensions = csr.getAttribute({name: 'extensionRequest'}).extensions;
// optionally add more extensions
extensions.push.apply(extensions, [{
  name: 'basicConstraints',
  cA: true
}, {
  name: 'keyUsage',
  keyCertSign: true,
  digitalSignature: true,
  nonRepudiation: true,
  keyEncipherment: true,
  dataEncipherment: true
}]);
cert.setExtensions(extensions);
*/
// self-sign certificate
cert.sign(keys.privateKey);
// console.log(cert.generateSubjectKeyIdentifier())
// convert a Forge certificate to PEM
// console.log(cert)
var pem = pki.certificateToPem(cert);
// console.log(pem)

// var certpem = pki.certificationRequestToPem(cert);
// console.log(certpem)
// var cc = pki.pemToDer(pem);

// console.log(util.encode64(cc.getBytes()))

var csr = `-----BEGIN CERTIFICATE-----
MIIC4jCCAcqgAwIBAgIBADANBgkqhkiG9w0BAQUFADAAMB4XDTIyMDIyNjE5MjU1
MFoXDTIyMDIyNjE5MjU1MFowaTEUMBIGA1UEAxMLZXhhbXBsZS5vcmcxCzAJBgNV
BAYTAlVTMREwDwYDVQQIEwhWaXJnaW5pYTETMBEGA1UEBxMKQmxhY2tzYnVyZzEN
MAsGA1UEChMEVGVzdDENMAsGA1UECxMEVGVzdDCCASIwDQYJKoZIhvcNAQEBBQAD
ggEPADCCAQoCggEBALoZS3j++V+lzWz6qQL9X4D9Fk3tn7AWHOA+v8//QKqzcl7t
nd4kpJHtGi6jEscf8ygNFG/dCRAjFmv+WSpx9lMIoO2Y3atIeRSrEh89N4+SlHM0
Dvki498CZE6n0ilCavgGzzcZw3Rothfnq2LcCqmDjxQNAdDAlAbyvN7WPiw4iEEA
Y+bqJtsC/6WU22CkQIpFk3c96rcZAX6l0yH4fwx76MSOVGmR7+KF+0S8/gtgjces
EQCbiQo5fk6eX5SShqc3wELImWlZorfV1IJwyg7h0jHQ7Fhcyl5X4H19AaInDVdG
P5HR7h6ujP7p0ETAA2UF4KjxoCKCRd+XWf2MdCUCAwEAATANBgkqhkiG9w0BAQUF
AAOCAQEAGefe8Xyr1/c9nQiOOno0cYNkY4bl7FgSx8m/mBWqmQVhbOxk2f8fPGOF
rxxXnnTAUu6hqc3hRSzpbSEqIjade6dpDzKh4srpIjCsmXrCLLs0NCKlfZEcrtX2
hKi7/6JRtujkDPTlnnnRQqJ4t9IbgBunBh5zYOBVcONq/LPnUorXvQpAHDn7L5lR
M3gtGYFNZGrM48rm7IL6osHlwh/DTwP4OFWNfyhVRUIQsGNMQJtxTWcDIYRD+M6V
vRNcpZ+DNbJllW7UVx0VCZcY+FeGVN1kL8ITYw4dZjs6Kbmgd3FAlVqg7sF7vHQA
J3DA7YppwFiGU7fzygYqI0rKWthZjg==
-----END CERTIFICATE-----`;

// var inverce = pki.certificateToPem(pem);

// console.log(inverce)

var cert = pki.certificateFromPem(csr);
console.log(cert)
console.log(cert.generateSubjectKeyIdentifier().getBytes())
console.log(cert.verify())
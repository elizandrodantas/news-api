import forge, { pki, util } from 'node-forge';
var keys = forge.pki.rsa.generateKeyPair(2048);
import { ForgeSecure } from '../src/core/Forge';

let controller = new ForgeSecure();

// controller.setCertDN({
//   device_id: "1234",
//   device_name: "web",
//   username: "admin"
// });

// controller.createCertificate();


// console.log(controller.getCreateCertificateData())

controller.setSignedCertBase64(`MIIC2TCCAcECAQAwgZMxGDAWBgNVBAMMDzAxNzI1MjMxMTc0X3ByZDESMBAGA1UECgwJQmFuY28gUGFuMRgwFgYKCZImiZPyLGQBGRYIU00tSjczMEcxSTBHBgNVBAsMQDMzNGQwZGYwMmE5OTg2MmQxM2FkMWNjNWM5YWJkZjVjYjMyY2RmZmVmNzI4YWU4MTA5MWFkNWIzMDgyZTk4NmMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDPp0+ZVYs/vssh94ISN4i8lZkgntYmX7OJyb96fVDlEO/i2wNSN4+zr1x5zV0ypqKSHm2VtQDHa+E9D3k5UBtCraKZLEKars4WPzUcfxYu+ExnGQwQbNGSlJ0DVMjwk7RuPfcYHoDlWeUYkMiHTYglsPv7hgiZFiEAq/N3SLcITNmFq+0ySQtHAe8SAvZrHCO7fES611wf7MecMkgNVTk0+ZXU6TJP+wBeUWapCZfmjvaX3lFaFG5n5KgGQPPDQBveeyQnAqIOKno5I6Gkptx2AOW+QRKimmmRidnj4qYQgw5cBgmxagwViNLUTc1WyBDleJNo3kutZndLEP9SYe7RAgMBAAGgADANBgkqhkiG9w0BAQUFAAOCAQEAyJ/b48EdC+lITdc2qRE1veZSaGQiYFyTD735nrTSlu0nxdcHlMtPPy30tn2ZFbJ2XNxCZ9fUkXXH/5UrPErkFEjzNI2X5aY0bSRNp+uacJqyIBaooHCCzODFmX5O0OSokiw7BSmQGu2/rQNOhsEFq5kCXjKDfqH3BQ6qTZuHrMQV/dXODXZ/Ys5vpAcTpVkVwYiQFsh85hN0RktxtHu/TC2A9N/iQfuf6Kfxajjm0vcagpNFEmIq5b2JpXz9PLbJctUVulXEpMjes55YlHewbv+unRR/PNzgm079MNN6Wiw4AVtuHWbLfVMbwwKSKX5qbwYtzbouvanTMLoVdLpgzQ==`)
controller.setCsrBase64(controller.formatedSignedCertBase64())
console.log(controller.generateGross())
// // console.log(controller.validateGross("Fw7HBpLz5yuqZzqBQ4semNltiuI="))
// controller.setDevice({
//   device_id: "123",
//   device_name: "web"
// });
console.log(controller)
// console.log(controller.validateDevice())
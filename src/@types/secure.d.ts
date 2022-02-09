declare interface iFunctionSignature {
    generate: (sessionId: string, privateKeyPem: string) => string;
    verify: (sessionId: string, signature: string, publicKeyPem: string) => boolean;
}

declare interface iFunctionForge {
    iv: () => string;
    encrypt: (e: string, t: string, r: string) => string;
    decrypt: (e: string, t: string, r: string) => string;
    encode64: (string: string) => string;
    decode64: (string: string) => string;
}
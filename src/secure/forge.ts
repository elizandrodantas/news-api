import forge from 'node-forge';

export function forgeSecure(): iFunctionForge{
    return {
        iv: generateIv,
        encrypt,
        decrypt,
        encode64,
        decode64
    }
}

function generateIv(): string{
    let g = forge.random.getBytes(16);
    let e = encode64(String(g));
    return e;
}

function encrypt(e: string, t: string, r: string): string{
    if(!e || !t || !r) return "";

    try{
        r = decode64(r);

        let n = forge.cipher.createCipher('AES-CBC', t);
        n.start({ iv: r });
        n.update(forge.util.createBuffer(e));
        n.finish();
        return forge.util.encode64(n.output.getBytes())
    }catch(_){return ""}
}

function decrypt(e: string, t: string, r: string): string{
    if(!e || !t || !r) return "";

    try{
        e = decode64(e);
        r = decode64(r);
        let n = forge.cipher.createDecipher("AES-CBC", t);
        n.start({ iv: r });
        n.update(forge.util.createBuffer(e));
        n.finish();
        
        return n.output.toString();
    }catch(_){return ""}
}

function decode64(string: string): string {
    return forge.util.decode64(string);
}

function encode64(string: string): string {
    return forge.util.encode64(string);
}
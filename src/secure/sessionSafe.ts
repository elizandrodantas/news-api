import { forgeSecure } from "./forge";

export class SessionSecure {
    decoded: string;

    constructor(
        private sub: string,
    ){}

    private verify(){
        if(!this.sub) return false
        return true;
    }

    decode(){
        if(!this.verify()) return new Error("session signature invalid");

        let d = this.decodeSub(this.sub);
        if(!d || d instanceof Error) return new Error("session signature invalid");

        this.decoded = d;

        return this
    }

    getDecoded(){ return this.decoded }

    verifyRelative(relative: string){
        if(!relative || !this.decoded) return false;

        if(relative !== this.decoded) return false;

        return true;
    }

    decodeSub(sub: string){
        let c = forgeSecure, d = c().decode64(sub), [iv, key] = d.split(':');
        if(!iv || !key) return new Error("session invalid");
        return c().decrypt(key, process.env.KEY_FORGE, iv);
    }
}
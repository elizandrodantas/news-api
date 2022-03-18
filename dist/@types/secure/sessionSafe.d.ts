export declare class SessionSecure {
    private sub;
    decoded: string;
    constructor(sub: string);
    private verify;
    decode(): Error | this;
    getDecoded(): string;
    verifyRelative(relative: string): boolean;
    decodeSub(sub: string): string | Error;
}

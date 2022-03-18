export declare class OTP {
    userId: string;
    vCode?: string;
    vkey?: string;
    code: string;
    secret: string;
    type: "sms" | "mail" | "oauth";
    counter: number;
    taskId: string;
    expire: number;
    typeExp: "d" | "h" | "m" | "s";
    constructor(userId: string, type: "sms" | "mail" | "oauth", vCode?: string, vkey?: string);
    generateOtp(): this | Error;
    verifyOtp(): this | Error;
    getCode(): string;
    save(): Promise<this | Error>;
    updateWorkAgreged(taskId: string, workId: string): Promise<this>;
    abortService(taskId: string): Promise<void>;
    private createSha256;
    private generateExp;
}
export declare class otp_util {
    array: any[];
    getOtpArray(array: any): this;
    code(): string[];
}

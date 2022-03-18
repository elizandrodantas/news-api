export declare class sendMailer {
    body: string;
    subject: string;
    textPart: string;
    taskId: string;
    sendId: string;
    to: [{
        Name: string;
        Email: String;
    }];
    response: Error | any;
    constructor();
    setDetails(to: [{
        Name: string;
        Email: String;
    }], body: string): this;
    setPayload(subject: string, textPart: string): this;
    getSendId(): string;
    send(): Promise<this>;
    get(): Promise<Error | {
        id: string;
        taskId: string;
        sending: string;
    }>;
}

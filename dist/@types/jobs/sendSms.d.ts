import { Message } from 'messagebird';
export declare class sendSms {
    taskId: string;
    originator: string;
    to: string;
    body: string;
    ddi: string;
    status: boolean;
    response: Error | Message;
    constructor();
    setOrigin(string: string): this;
    setDetails(to: string, body: string): this;
    setDDI(ddi: string): this;
    send(): Promise<Error | this>;
    get(): Promise<Error | {
        id: string;
        taskId: string;
        sending: string;
    }>;
    updatedFinish(taskId: string, workId: string): Promise<void>;
}

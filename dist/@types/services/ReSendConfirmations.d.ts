export declare class ReSend {
    mail(id: string): Promise<Error | {
        status: boolean;
        taskId: string;
        sending: string;
    }>;
    cell(id: string): Promise<Error | {
        status: boolean;
        taskId: string;
        sending: string;
    }>;
}

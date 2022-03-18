import moment from "moment";
import { otp_util } from "../controllers/otpController";
export declare class Confirmations extends otp_util {
    mail(id: string, code: string): Promise<Error | {
        status: boolean;
        confirmed: any;
    }>;
    cell(id: string, code: string): Promise<Error | {
        status: boolean;
        confirmed: moment.Moment;
    }>;
    updateStatus(userId: string, otpId: string, type: "mail" | "cell"): Promise<any>;
}

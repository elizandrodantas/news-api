import uid from 'uid2';
import config from '../config/sms';
import messagebird, { Message } from 'messagebird';
import moment from 'moment';
import { Prisma } from '../database/prisma';
let work = messagebird("tuN920B7oNWRiqdB8YZxEvD8k");

export class sendSms {
    taskId: string;
    originator: string;
    to: string;
    body: string;
    ddi: string;

    status: boolean = false;

    response: Error | Message;

    constructor(){
        if(!this.taskId) this.taskId = uid(32);
    }

    setOrigin(string: string): this{
        return this.originator = string, this;
    }

    setDetails(to: string, body: string): this{
        return this.to = to, this.body = body, this;
    }

    setDDI(ddi: string): this{
        if(ddi.indexOf('+') !== 0) return this;
        return this.ddi = ddi, this;
    }

    async send(): Promise<Error | this>{
        if(!this.originator) this.originator = config.originator;
        if(!this.body || !this.to) return new Error("to or body not defined");
        if(!this.ddi) this.ddi = config.ddi;

        work.messages.create({
            originator: this.originator,
            recipients: [
                this.ddi + this.to
            ],
            body: this.body
        }, (err, suc) => {
            if(err) this.response = new Error("error sending sms");
            this.response = suc
        });

        return this;
    }

    async get(): Promise<Error | {
        id: string, taskId: string, sending: string;
    }> {
        let r = -1;
        for(;;){
            await new Promise((resolve) => setTimeout(resolve, 1000));
            r++;
            if(this.response) break;
            if(r > 3) break;
        }

        if(!this.response) return new Error("time out send sms");
        if(this.response instanceof Error) return new Error(this.response.message);

        let { id } = this.response; 

        return { id, taskId: this.taskId, sending: moment().toISOString()}
    }

    async updatedFinish(taskId: string, workId: string): Promise<void>{
        if(workId && taskId){
            await Prisma.otp.update({
                where: { id: taskId },
                data: {
                   workId 
                }
            });
        }
    }
}
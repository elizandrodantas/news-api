import axios from 'axios';
import { toBase64 } from '../util/base64';
import { Prisma } from '../database/prisma';
import config from '../config/mailjet';
import uid2 from 'uid2';
import moment from 'moment';

export class sendMailer {
    body: string;
    subject: string;
    textPart: string;
    taskId: string;
    sendId: string;
    to: [{Name: string, Email: String}];

    response: Error | any

    constructor(){
      if(!this.taskId) this.taskId = uid2(32);
    }

    setDetails(to: [{Name: string, Email: String}], body: string): this {
        return this.to = to, this.body = body, this;
    }

    setPayload(subject: string, textPart: string): this{
        return this.subject = subject, this.textPart = textPart, this;
    }

    getSendId(){
        return this.sendId;
    }

    async send(): Promise<this> {
      try{
        let send = await axios("https://api.mailjet.com/v3.1/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Basic ${toBase64(`${process.env.MAILJET_KEY_ONE}:${process.env.MAILJET_KEY_TWO}`)}`
          },
          data: JSON.stringify({
            Messages: [
              {
                From: {
                  Email: config.mail.email,
                  Name: config.mail.name
                },
                To: this.to,
                Subject: this.subject,
                TextPart: this.textPart,
                HTMLPart: this.body
              }
            ]
          })
        });

        let { data } = send;

        this.response = data;
      }catch(_){
        this.response = new Error("mail not sended");
      }

      return this;
    }

    async get(): Promise<Error | {
      id: string, taskId: string, sending: string;
  }>{
      let r = -1;

      for(;;){
        r++;
        if(this.response) break;
        if(r > 3) break;
        await new Promise((resolve) => setInterval(resolve, 1000));
      }

      if(!this.response) return new Error("error send mail");

      if(this.response instanceof Error) return new Error(this.response.message);

      let id = [];

      try{
        id = this.response.Messages[0].To.map(e => e.MessageID);
      }catch(_){}

      return {
        id: id.join(','),
        taskId: this.taskId,
        sending: moment().toISOString()
      }
    }
}
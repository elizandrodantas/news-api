import { hotp } from "otplib";
import { createHash } from 'crypto';
import { random, util as utilForge } from 'node-forge';
import moment from 'moment';
import { Prisma } from "../database/prisma";

export class OTP {
    code: string;
    secret: string;
    type: "sms" | "mail" | "oauth";
    counter: number;
    taskId: string;
    expire: number;
    typeExp: "d" | "h" | "m" | "s" = "m";

    constructor(
        public userId: string,
        type: "sms" | "mail" | "oauth",
        public vCode?: string,
        public vkey?: string
    ){
        this.type = type;
    }

    /* 
    /*   GENERATED AND VERIFY OTP METHOD MAILER
    /*   TECNOLOGY: NODE-FORGE, CRYPTO, OTP LIB
    /*   LOGIC: [
    /*       CODE: GENERATE HOTP > LIB OTPLIB
    /*       SECRET: GENERATE BYTE FORGE > ENCODE64 > ENCODE64 {byteForge:COUNTER}
    /*       COUNTER: GENERATE MATH [0, 100]
    /*   ]
    */

    generateOtp(): this | Error {
        try{
            this.secret = random.getBytesSync(16);
            this.secret = utilForge.encode64(this.secret);
            this.secret = this.createSha256(this.secret);
            this.counter = Math.floor(Math.random() * 100)

            this.code = hotp.generate(this.secret, this.counter);

            this.secret = utilForge.encode64(`${this.secret}:${this.counter}`);

            return this;
        }catch(_){return new Error("error generate code")}
    }

    verifyOtp(): this | Error {
        try{
            if(!this.vkey || !this.vCode) return new Error("code and key not defined");
            let [secret, counter] = utilForge.decode64(this.vkey).split(":");
            if(!secret || !counter) return new Error("invalid code, try again");

            this.secret = secret;
            this.vkey = secret;
            this.code = this.vCode;
            this.counter = Number(counter);

            let verify = hotp.verify({token: this.code, secret: this.secret, counter: Number(counter)});
            if(!verify) return new Error("invalid code, try again")
            
            return this;
        }catch(_){return new Error("code verify invalid")}
    }

    /* 
    /*   CONFIGURATION FINISH
    /*   METHODS: [GET: GET CODE AND SECRET] [SAVE: SAVE DATABASE OTP] [UPDATE: UPDATE DATABASE USER]
    */

    getCode(): string {return this.code}

    async save(): Promise<this | Error> {
        if(!this.code || !this.secret || !this.type || !this.userId) return new Error("code or secret not generate");

        if(!this.expire) this.expire = 20;
        if(!this.typeExp) this.typeExp = "m";

        let create = await Prisma.otp.create({data: {
            type: this.type,
            code: this.code,
            secret: this.secret,
            expireIn: this.generateExp(this.expire, this.typeExp),
            userId: this.userId
        }}).catch(e => e);
     
        if(!create) return new Error("error create otp");

        let { id } = create;
        this.taskId = id;

        return this;
    }

    async updateWorkAgreged(taskId: string, workId: string): Promise<this>{
        if(taskId && workId){
          await Prisma.otp.update({
            where: { id: taskId },
            data: {
              workId
            }
          });
        }

        return this;
      }

      async abortService(taskId: string): Promise<void>{
          if(taskId){
              await Prisma.otp.delete({
                  where: { id: taskId }
              });
          }
      }

    /*
    /*  UTILS CONTROLLER
    */

    private createSha256(key: string): string{
        return createHash("sha256").update(key).digest("hex");
    }
 
    private generateExp(time: number = 1, short: "d" | "h" | "m" | "s" = "m"): number{
        return moment().add(time, short).unix();
    }
}

export class otp_util {
    array = [];

    getOtpArray(array: any): this {
        return this.array = array, this;
    }

    code(): string[]{
        try{
            let res: string[] = [];
            this.array.map(e => {
                res.push(e.code);
            })

            return res;
        }catch(_){return [""]}
    }

    // ****************************** //
}
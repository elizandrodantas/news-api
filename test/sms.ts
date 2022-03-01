import { sendSms } from "../src/jobs/sendSms";

(async()=>{
    let controller = new sendSms();

    controller.setDetails("", "teste");
    // controller.send()
    // console.log(await controller.get())
    controller.verifyId("29903af7b5154c30b5158c9788103383")
})();
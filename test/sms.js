"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendSms_1 = require("../src/jobs/sendSms");
(async () => {
    let controller = new sendSms_1.sendSms();
    controller.setDetails("", "teste");
    controller.verifyId("29903af7b5154c30b5158c9788103383");
})();

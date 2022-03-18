"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WordPress_1 = require("../src/services/WordPress");
(async () => {
    let controller = new WordPress_1.Service_WordPress("a7cc3770-8b9c-4ef6-a8f8-b051bfeb6c97", "1fa7ec50-1bab-484c-869f-c10a5afcd54b");
    await controller.getToken();
})();

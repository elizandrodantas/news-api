import { Service_WordPress } from "../src/services/WordPress";
import wpapi from 'wpapi';
import axios from 'axios';

(async () => {
    let controller = new Service_WordPress("a7cc3770-8b9c-4ef6-a8f8-b051bfeb6c97", "1fa7ec50-1bab-484c-869f-c10a5afcd54b");

    // console.log(await controller.getTaxonomies())

    await controller.getToken();

    // console.log(await controller.addTaxonomies({
    //     name: ["novo teste 2", "novo teste 3"],
    //     description: ["novo teste 07/02/22"]
    // }, "category"))

    // console.log(await controller.addImage({
    //     title: "new image",
    //     description: "teste new image",
    //     status: 'publish',
    //     url: "https://pt.org.br/wp-content/uploads/2022/02/lula-entrevistacbn-vale-paraiba-ricardostuckert-5.jpeg",
    //     author: 0,
    //     post_id: 26
    // }))

    // const wp = new wpapi({
    //     endpoint: "http://dev.portalnpm.com/wp-json"
    // });


    // axios({
    //     url: "https://www.cnnbrasil.com.br/wp-content/uploads/sites/12/Reuters_Direct_Media/BrazilOnlineReportTopNews/tagreuters.com2021binary_LYNXMPEHBK0OL-FILEDIMAGE.jpg?w=876&h=484&crop=1",
    //     method: "GET",
    //     responseType: "arraybuffer"
    // }).then(e => {
    //     // let buffer = Buffer.from(e.data);

    //     // console.log(e.data)

    //     wp.media()
    //     .file(e.data, 'nameimage.jpg')
    //     .setHeaders({
    //         authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZGV2LnBvcnRhbG5wbS5jb20iLCJpYXQiOjE2NDQyNTgyOTgsIm5iZiI6MTY0NDI1ODI5OCwiZXhwIjoxNjQ0ODYzMDk4LCJkYXRhIjp7InVzZXIiOnsiaWQiOiIxIn19fQ.75nB04Kl9MsBQWSznoyZYmqONWcCbnP5oVjNgB7J6KQ"
    //     }).create({
    //         title: "teste novo",
    //         description: "teste teste"
    //     }).then(e => console.log(e)).catch(e => console.log(e));
    // }).catch(e => {console.log(`ERROR:`); console.log(e)})

    // wp.media()
    // .file('./test/bolsonaro-1-1.jpg')
    // .setHeaders({
    //     authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZGV2LnBvcnRhbG5wbS5jb20iLCJpYXQiOjE2NDQyNTgyOTgsIm5iZiI6MTY0NDI1ODI5OCwiZXhwIjoxNjQ0ODYzMDk4LCJkYXRhIjp7InVzZXIiOnsiaWQiOiIxIn19fQ.75nB04Kl9MsBQWSznoyZYmqONWcCbnP5oVjNgB7J6KQ"
    // }).create({
    //     title: "teste novo",
    //     description: "teste teste"
    // }).then(e => console.log(e)).catch(e => console.log(e));
})(); 
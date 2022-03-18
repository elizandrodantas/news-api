"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wordpress_1 = require("../src/core/Wordpress");
const cheerio_1 = require("cheerio");
(async () => {
    let controller = new Wordpress_1.CoreWordPress({
        category: "",
        intitle: "",
        raw: true,
        limit: 10
    }).start();
    console.log(await controller.isGetContentR7("61f18bf2cd77c06e1800007e"));
    function removeTag() {
        var body = `A cidade de <a href="https://brasil.elpais.com/noticias/sao-paulo/" target="_blank">São Paulo</a> será governada por um controverso líder. Com a <a href="https://brasil.elpais.com/brasil/2021-05-16/morre-o-prefeito-bruno-covas-aposta-de-renovacao-tucana-em-sao-paulo.html" target="_blank">morte neste domingo do prefeito Bruno Covas</a> (PSDB), assumirá a prefeitura o vice Ricardo Nunes (MDB), de perfil mais conservador que o tucano, católico atuante e com experiência política anterior de dois mandatos na Câmara Municipal, onde chegou a compor as bases petista e tucana. Nunes, descrito como “sério” e “ponderado” por antigos colegas do Legislativo, terá à frente especialmente os desafios de seguir as políticas de combate à pandemia e a revisão do plano diretor da cidade. Distante do núcleo duro do tucanato, ele é visto por vereadores como alguém leal a Covas e solícito até mesmo com a oposição.`;
        const html = (0, cheerio_1.load)(body);
        const target = html('a').attr();
        const remove = html('a');
        for (let t in target) {
            remove.removeAttr(t);
        }
        var text = html.html();
        const removedFinish = ["html", "body", "a", "head"];
        for (let r of removedFinish) {
            text = text.replace(new RegExp("<" + r + ">", "gi"), "").replace(new RegExp("</" + r + ">", "gi"), "");
        }
        ;
        return text;
    }
})();

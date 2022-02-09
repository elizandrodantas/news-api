import { config } from "dotenv";
config();

const d = {
    baseUrl: {
        elpais: process.env.URL_SERVICE_NEWS_ELPAIS,
        g1: process.env.URL_SERVICE_NEWS_G1,
        g1_raw: process.env.URL_SERVICE_NEWS_G1_RAW,
        ge_raw: process.env.URL_SERVICE_NEWS_GE_RAW,
        r7: process.env.URL_SERVICE_NEWS_R7
    },
    key: {
        elpais: process.env.KEY_API_ELPAIS
    },
    sources: ["g1", "r7", "elpais"],
    response: {
        elpais: {
            source: "El Pais Brasil",
            url: "https://brasil.elpais.com/"
        },
        g1: {
            source: "G1",
            url: "https://g1.globo.com/"
        },
        r7: {
            source: "R7",
            url: "https://www.r7.com/"
        }
    },
    timeoutRequest: 10 * 10 * 150, // 15.000 ms - 15 segundos
    category: {
        primary: {
            elpais: "internacional",
            g1: "g1",
            r7: "520e62a3090cda3f310083d5"
        },
        array: {
            elpais: [
                "economia",
                "internacional",
                "ciencia",
                "tecnologia",
                "cultura",
                "estilo",
                "esportes",
                "sociedade",
                "politica"
            ].sort(),
            g1: [
                "home",
                "agro",
                "carros",
                "saude",
                "ciencia",
                "economia",
                "educacao",
                "mundo",
                "politica",
                "tecnologia",
                "turismo",
                "viagem",
                "esporte",
                "futebol",
                "olimpiadas",
                "formula-1"
            ].sort(),
            r7: [
                "home",
                "esporte",
                "automobilismo",
                "olimpiadas",
                "lance",
                "educacao",
                "noticias",
                "politica",
                "entretenimento",
                "games",
                "musica",
                "saude"
            ].sort()
        },
        obj: {
            elpais: {
                home: "internacional",
                economia: "economia",
                internacional: "internacional",
                ciencia: "ciencia",
                tecnologia: "tecnologia",
                cultura: "cultura",
                estilo: "estilo",
                esporte: "esportes",
                sociedade: "sociedade",
                politica: "politica",
            },
            g1: {
                home: "g1",
                agro: "https://g1.globo.com/economia/agronegocios/",
                carros: "https://autoesporte.globo.com/",
                saude: "https://g1.globo.com/ciencia-e-saude/",
                ciencia: "https://g1.globo.com/ciencia-e-saude/",
                economia: "https://g1.globo.com/economia/",
                educacao: "https://g1.globo.com/educacao/",
                mundo: "https://g1.globo.com/mundo/",
                politica: "https://g1.globo.com/politica/",
                tecnologia: "https://g1.globo.com/economia/tecnologia/",
                turismo: "https://g1.globo.com/turismo-e-viagem/",
                viagem: "https://g1.globo.com/turismo-e-viagem/",
                esporte: "ge",
                futebol: "https://ge.globo.com/futebol/",
                olimpiadas: "https://ge.globo.com/olimpiadas/",
                'formula-1': "https://ge.globo.com/motor/formula-1/",
            },
            r7: {
                home: "520e62a3090cda3f310083d5",
                esporte: "4f99869f6c4db22c70000004",
                automobilismo: "518360690d9a031fb6014e93",
                olimpiadas: "518360ba0d9a03cae001ad62",
                lance: "543fd32a6745ee14aa00b480",
                educacao: "518297f82bc24312eb011f92",
                noticias: "4f70b9a96c4db25194000110",
                politica: "5d8d5969ca90847e34001f12",
                entretenimento: "502510c61d420654b1000001",
                games: "5d8cf39bca90846933000433",
                musica: "51835fc80d9a037263013c62",
                saude: "5036245a6745ee6ae900003e",
            }
        }
    }
}

export default d;
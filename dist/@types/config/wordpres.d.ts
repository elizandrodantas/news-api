declare const _default: {
    baseUrl: {
        elpais: string;
        g1: string;
        g1_raw: string;
        ge_raw: string;
        r7: string;
    };
    key: {
        elpais: string;
    };
    sources: string[];
    response: {
        elpais: {
            source: string;
            url: string;
        };
        g1: {
            source: string;
            url: string;
        };
        r7: {
            source: string;
            url: string;
        };
    };
    timeoutRequest: number;
    category: {
        primary: {
            elpais: string;
            g1: string;
            r7: string;
        };
        array: {
            elpais: string[];
            g1: string[];
            r7: string[];
        };
        obj: {
            elpais: {
                home: string;
                economia: string;
                internacional: string;
                ciencia: string;
                tecnologia: string;
                cultura: string;
                estilo: string;
                esporte: string;
                sociedade: string;
                politica: string;
            };
            g1: {
                home: string;
                agro: string;
                carros: string;
                saude: string;
                ciencia: string;
                economia: string;
                educacao: string;
                mundo: string;
                politica: string;
                tecnologia: string;
                turismo: string;
                viagem: string;
                esporte: string;
                futebol: string;
                olimpiadas: string;
                'formula-1': string;
            };
            r7: {
                home: string;
                esporte: string;
                automobilismo: string;
                olimpiadas: string;
                lance: string;
                educacao: string;
                noticias: string;
                politica: string;
                entretenimento: string;
                games: string;
                musica: string;
                saude: string;
            };
        };
    };
};
export default _default;

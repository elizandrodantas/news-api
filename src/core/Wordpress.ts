import config from '../config/wordpres';
import axios from 'axios';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { clearSpecialsText } from '../util/text';
import { load } from 'cheerio';
import { draftToHtml } from '../util/draftToHtml'

interface iGetArticleManyOptions {
    limit?: number;
    raw?: boolean;
    intitle?: string;
    category?: string;
}

interface iResponsePatternFormat {
    _id: string;
    id: string;
    'url-notice': string;
    title: string;
    subTitle: string;
    category: string;
    image: string;
    'image-type': string;
    author: string;
    date: string;
    type: string;
    source: string;
    'url-source': string;
}

interface iResponseContentFormat {
    _id: string;
    id: string;
    'url-notice': string;
    title: string;
    subTitle: string;
    metas: [string];
    image: string;
    'image-type': string;
    author: string;
    premium: boolean;
    content: string;
    date: string;
    language: string;
    status: boolean;
    source: string;
    'url-source': string;
}

interface iConfigGetContentElPais {
    photoToBody?: boolean;
    removeTag?: boolean;
    captionPhotoBody?: boolean;
    authorPhotoBody?: boolean;
}

interface iParamGet {
    sort?: boolean;
    blankLine?: boolean;
}

export class CoreWordPress {
    constructor(
        public options?: iGetArticleManyOptions
    ){}

    private category: string;
    private raw: boolean;
    private limit: number;
    private intitle: string;
    private starting: boolean = false;

    private result: iResponsePatternFormat[] = [];
    private content: iResponseContentFormat | Error

    // ******* CONTROLLER ******* //

    start(): this {
        let { limit, raw, intitle, category } = this.options;

        if(void limit === 0 || typeof limit !== "number") limit = -1;
        if(void raw === 0 || typeof raw !== "boolean") raw = false;
        if(void intitle === 0 || typeof intitle !== "string") intitle = "";
        if(void category === 0 || typeof category !== "string") category = "";

        return this.starting = true, this.limit = limit, this.category = category, this.intitle = intitle, this.raw = raw, this
    }

    public get(param?: iParamGet): iResponsePatternFormat[] | Error {
        if(!this.starting) return new Error("service not starting");

        if(param && typeof param === "object" && param.sort) this.resolve_shuffleArray(this.result, res => this.result = res);

        return this.result;
    }

    public getContent(): iResponseContentFormat | Error {
        return this.content;
    }

    // ******* PORTAL R7 ******* //

    async isGetArticleR7(): Promise<this>{
        if(!this.starting) return this;

        let c = this.resolve_category(this.category, "r7");

        try{
           let get = await axios({
               url: config.baseUrl.r7 + "/v1/r7app/sections/" + c + "/layout_contents",
               method: "GET",
               timeout: config.timeoutRequest || 10 * 10 * 100
           }); 

           let { data } = get;

           for(let index of data){
                if(index){
                    for(let i of index.medias){
                        if(i.type_media === "article"){
                            this.result.push({
                                _id: i.resource_id || uuidv4(),
                                id: i.resource_id,
                                "url-notice": i.url,
                                title: i.title,
                                subTitle: "",
                                category: i.section_name,
                                image: i.image,
                                "image-type": "",
                                type: i.type_media,
                                author: "",
                                date: moment().toISOString(),
                                source: config.response.r7.source,
                                "url-source": config.response.r7.url
                            })
                        }
                    }
                }
           }

           return this;
        }catch(_){
            if(this.raw) return console.log(`[x] ERROR GET ARTICLES {R7}`), this;
        }
    }
    
    async isGetContentR7(id: string): Promise<Error | iResponseContentFormat>{
        if(!id || !/^[0-9a-fA-F]{24}$/.test(id)) return new Error("ID article invalid");

        try{
            let get = await axios({
                url: config.baseUrl.r7 + "/article/" + id,
                method: "GET",
                timeout: config.timeoutRequest || 10 * 10 * 100
            });

            let { data } = get, { content } = data;

            let response = {
                _id: data.section_id || uuidv4(),
                id,
                "url-notice": data.shortened_url || `http://${data.url}` || "",
                title: data.title,
                subTitle: data.subtitle || "",
                metas: data.title.split(' ').filter($ => $.length > 3) || [],
                image: data.cover_image || "",
                "image-type": "image/jpg",
                author: data.author,
                premium: false,
                content: this.resolveContentR7(content),
                date: data.created_at || moment().toISOString(),
                language: "pt",
                status: true,
                source: config.response.r7.source,
                "url-source": config.response.r7.url
            }

            return this.content = response, response
        }catch(_){
            if(this.raw) console.log(`[x] ERROR GET CONTENT {R7}`);

            let response = new Error("error get content")

            if(_.response && _.response.status === 404) response = new Error("article not exist or desabled");

            return this.content = response, response;
        }
    }

    // ******* PORTAL G1 ******* //

    async isGetArticleG1(): Promise<this>{
        if(!this.starting) return this;

        let c = this.resolve_category(this.category, "g1");

        try{
            let get = await axios({
                url: config.baseUrl.g1 + "/feed/" + c,
                method: "GET",
                timeout: config.timeoutRequest || 10 * 10 * 100
            });

            let { data } = get, { feed } = data, { falkor } = feed, { items } = falkor;

            function imgResolve(objection: {height: number, url: string, width: number}){
                if(!objection) return "";
                let preference = ["L", "M", "S", "V"];
                let keys = Object.keys(objection)
                let r = keys.filter(e => preference.includes(e));

                if(r.length > 0){
                    return objection[r[0]].url;
                }else{
                    return ""
                }
            }

            for(let index of items){
                let { content } = index;
                if(index && content && index.type === 'materia' && !content.video){
                    try{  
                        this.result.push({
                            _id: index.id || uuidv4(),
                            id: content.url,
                            "url-notice": content.url,
                            title: content.title,
                            subTitle: content.summary || "",
                            category: content.chapeu.label || content.chapeu.section || "",
                            image: content.image ? imgResolve(content.image.sizes) : "",
                            "image-type": "",
                            author: "",
                            date: index.created || index.publication || moment().toISOString(),
                            type: index.type || "",
                            source: config.response.g1.source,
                            "url-source": config.response.g1.url
                        });
                    }catch(_){}
                }
            }
     
            return this;
        }catch(_){
            if(this.raw) return console.log(`[x] ERROR GET ARTICLES {G1}`), this;
        }
    }
    
    async isGetContentG1(id: string): Promise<Error | iResponseContentFormat>{
        if(!id || !id.match("globo.com/") || id.indexOf('https') !== 0) return new Error("ID article invalid");

        let options_url = id.split('/')[2] === "ge.globo.com" ? "ge_raw" : "g1_raw", 
            options_id  = id.split('/')[2] === "ge.globo.com" ? id.split('https://ge.globo.com/').join('') : id;

        try{
            let get = await axios({
                url: config.baseUrl[options_url] + "/" + options_id,
                method: "GET",
                timeout: config.timeoutRequest || 10 * 10 * 100
            });

            let { data } = get, { resource } = data, img = this.resolve_photoG1(resource.bodyData);

            let response = {
                _id: resource.id || uuidv4(),
                id,
                "url-notice": id,
                title: resource.title,
                subTitle: resource.subtitle || "",
                metas: resource.title.split(' ').filter($ => $.length > 3) || [],
                image: img.url,
                "image-type": img.type,
                author: resource.creator || "",
                premium: false,
                content: this.resolve_contentG1(resource.bodyData),
                date: resource.created || moment().toISOString(),
                language: "pt",
                status: resource.status.type || resource.status.name || resource.status.slug || true,
                source: config.response.g1.source,
                "url-source": config.response.g1.url
            }

            return this.content = response, response;
        }catch(_){
            if(this.raw) console.log(`[x] ERROR GET CONTENT {G1}`);

            let response = new Error("error get content")

            if(_.response && _.response.status === 404) response = new Error("article not exist or desabled");

            return this.content = response, response;
        }
    }

    // ******* EL PAIS ******* //

    async isGetArticleElPais(): Promise<this>{
        if(!this.starting) return this;

        let c = this.resolve_category(this.category, "elpais");
  
        try{
            let get = await axios({
                url: config.baseUrl.elpais + "/list/ep/site/brasil.elpais.com/" + c,
                method: "GET",
                headers: {
                    "User-Agent": "ElPais/2.12.3(android)",
                    "Accept": "application/json",
                    "x-api-key": config.key.elpais
                },
                timeout: config.timeoutRequest || 10 * 10 * 100
            });

            let { data } = get, { content } = data;

            for(let index of content){
                if(index && index.type === "story" && index.uri){
                    try{
                        this.result.push({
                            _id: index.id || uuidv4(),
                            id: index.uri,
                            'url-notice': index.uri,
                            title: index.headlines.title,
                            subTitle: index.headlines.subTitle,
                            category: c,
                            image: index.metas.thumbnail.uri,
                            'image-type': index.metas.thumbnail["mime-type"],
                            author: index.author[0].tagAuthor.name,
                            date: moment().toISOString(),
                            type: index.type,
                            source: config.response.elpais.source,
                            'url-source': config.response.elpais.url
                        })
                    }catch(_){}
                }
            }

            return this;
        }catch(_){ 
            if(this.raw) return console.log(`[x] ERROR GET ARTICLES {EL PAIS}`), this;
        }
    }

    async isGetContentElPais(id: string): Promise<Error | iResponseContentFormat> {
        if(!id || id.indexOf("https://brasil.elpais.com/") !== 0) return new Error("ID article invalid");

        try{
        let get = await axios({
            url: config.baseUrl.elpais + "/assets/?uri=" + id,
            method: "GET",
            headers: {
                "User-Agent": "ElPais/2.12.3(android)",
                "Accept": "application/json",
                "x-api-key": config.key.elpais
            },
            timeout: config.timeoutRequest || 10 * 10 * 100
        });

        let { data } = get, { headlines, metas, author } = data;

        let response = {
            _id: data.id || uuidv4(),
            id,
            'url-notice': data.uri,
            title: headlines.title,
            subTitle: headlines.subTitle,
            metas: headlines.title.split(' ').filter($ => $.length > 3) || [],
            image: metas.thumbnail.uri || "",
            'image-type': metas.thumbnail["mime-type"] || "",
            author: author[0].tagAuthor.name || "",
            premium: data.isPremium || false,
            content: this.resolve_contentElPais(data.content, {
                photoToBody: true,
                captionPhotoBody: true,
                removeTag: true,
                authorPhotoBody: true
            }) || "",
            date: moment().toISOString(),
            language: data.language,
            status: data.status || true,
            source: config.response.elpais.source,
            'url-source': config.response.elpais.url
        }

        return this.content = response, response;

        }catch(_){
            if(this.raw) console.log(`[x] ERROR GET CONTENT {EL PAIS}`);

            let response = new Error("error get content")

            if(_.response && _.response.status === 370) response = new Error("article not exist or desabled");

            return this.content = response, response;
        }
    }

    // ******* UTILS ******* //

    private resolve_category(param: string, type: "r7" | "g1" | "elpais"): string{
        return config.category.obj[type][param] ? config.category.obj[type][param] : config.category.primary[type]
    }

    public resolve_intitle(): this{
        if(this.result && this.result.length > 0 && this.intitle){
            this.result = this.result.filter(_ => {
                if(_.title){
                    let fit = this.intitle.split(' ');
                    return _.title.split(' ').some(e => {
                        e = clearSpecialsText(e);
                        return fit.includes(e);
                    });
                }
            });
        }

        return this;
    }

    public resolve_limit(): this{
        if(this.limit && this.limit > 0){
            this.resolve_shuffleArray(this.result, (res: iResponsePatternFormat[]) => {
                this.result = res.slice(0, this.limit);
            });
        }

        return this;
    }

    private resolve_shuffleArray(array: any[], cb: (res: any[]) => void): this{
        var length = array.length;
        var shuffled: any[] = Array(length);
        for (var index = 0, rand; index < length; index++) {
            rand = Math.floor(Math.random() * (index - 1));
            if (rand !== index) shuffled[index] = shuffled[rand];
            shuffled[rand] = array[index];
        }

        cb(shuffled);

        return this;
    }

    private resolve_contentElPais(content: any, preference?: iConfigGetContentElPais): string {
        let body = [];

        for(let indice of content){
            if(indice && indice.name === "body"){
                let { elements: emt } = indice
                for(let element of emt){
                    if(element && element.elementType === "elementParagraph"){
                        let { content: paragraph, tag } = element;

                        if(preference.removeTag) paragraph = this.removeTag(paragraph, "a");
                        paragraph = this.addTag(paragraph, tag);
                        if(!paragraph.match("receber a newsletter")){
                            body.push(paragraph)
                        };
                    }
                    if(element && element.elementType === "photoExtension" && !element.primary){
                        if(preference.photoToBody){
                            let rampUp = [], { photo } = element, { image, caption, author} = photo;

                            if(preference.captionPhotoBody){
                                rampUp.push("<figure>");
                            }

                            rampUp.push(`<img src="${image.uri}" alt="${caption}">`);

                            if(preference.captionPhotoBody || preference.authorPhotoBody){
                                rampUp.push("<figcaption>");
                                if(caption){
                                    rampUp.push(caption);
                                    rampUp.push(' - ');
                                }
                                if(preference.authorPhotoBody && author && typeof author === "string"){
                                    rampUp.push("<figauthor>");
                                    rampUp.push(author);
                                    rampUp.push("</figauthor>");
                                }
                                rampUp.push("</figcaption>");
                                rampUp.push("</figure>");
                            }

                            if(rampUp && rampUp.length > 0) body.push(rampUp.join('').trim())
                        }
                    }
                }
            }
        }

        return body.join('').trim()
    }

    private removeTag(body: string, tag: string): string {
        if(!body || !tag) return "";
        
        let $ = load(body), target = $(tag).attr(), remove = $(tag);

        for(let t in target){
            remove.removeAttr(t);
        }

        var text = $.html();
        const rF = ["html", "body", tag, "head"];

        for(let r of rF){
            text = text.replace(new RegExp("<" + r + ">", "gi"), "").replace(new RegExp("</" + r + ">", "gi"), "");
        };

        return text;
    }

    private addTag(body: string, tag: string): string {
        if(!tag) return body;

        let res: string[] = [];
        
        res.push(`<`);
        res.push(tag);
        res.push(`>`);
        res.push(' ');
        res.push(body);
        res.push(' ');
        res.push('</');
        res.push(tag);
        res.push('>');

        return res.join('').trim();
    }

    private resolve_photoG1(array: any): {url: string, type: string}{
        try{
            if(!array.blocks) throw new Error();

            let { blocks } = array;

            let response = {
                url: "",
                type: ""
            }

            for(let indice of blocks){
                if(indice.type === "atomic" && indice.data){
                    let { data } = indice;
                    if(data.type === "backstage-photo"){
                        response.url = data.file.thumborUrl;
                        response.type = data.file.type;
                    }else if(data.type === "backstage-video"){
                        response.url = data.videoMetadata.thumb;
                        response.type = "image/" + data.videoMetadata.thumb.split('.')[data.videoMetadata.thumb.split('.').length-1]
                    }
                }
            };

            return response;
        }catch(_){  
            return {url: "", type: ""}
        }
    }

    private resolve_contentG1(blocks: any): string {
        if(!blocks) return "";
  
        return draftToHtml(blocks).trim().replace(/\n|\r/g, "");
    }

    private resolveContentR7(body: any): string {
        if(!body) return "";

        try{
            if(typeof body === "object"){
                body = body[0].article
            }else{
                body = body.article
            }

            return this.removeTag(body, "a");
        }catch(_){return body}
    }

    sourceRelation(string: string): boolean {
        return config.sources.includes(string);
    }

    sources(): any { return config.sources }
}
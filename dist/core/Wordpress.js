"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreWordPress = void 0;
const wordpres_1 = __importDefault(require("../config/wordpres"));
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const uuid_1 = require("uuid");
const text_1 = require("../util/text");
const cheerio_1 = require("cheerio");
const draftToHtml_1 = require("../util/draftToHtml");
class CoreWordPress {
    constructor(options) {
        this.options = options;
        this.starting = false;
        this.result = [];
    }
    start() {
        let { limit, raw, intitle, category } = this.options;
        if (void limit === 0 || typeof limit !== "number")
            limit = -1;
        if (void raw === 0 || typeof raw !== "boolean")
            raw = false;
        if (void intitle === 0 || typeof intitle !== "string")
            intitle = "";
        if (void category === 0 || typeof category !== "string")
            category = "";
        return this.starting = true, this.limit = limit, this.category = category, this.intitle = intitle, this.raw = raw, this;
    }
    get(param) {
        if (!this.starting)
            return new Error("service not starting");
        if (param && typeof param === "object" && param.sort)
            this.resolve_shuffleArray(this.result, res => this.result = res);
        return this.result;
    }
    getContent() {
        return this.content;
    }
    async isGetArticleR7() {
        if (!this.starting)
            return this;
        let c = this.resolve_category(this.category, "r7");
        try {
            let get = await (0, axios_1.default)({
                url: wordpres_1.default.baseUrl.r7 + "/v1/r7app/sections/" + c + "/layout_contents",
                method: "GET",
                timeout: wordpres_1.default.timeoutRequest || 10 * 10 * 100
            });
            let { data } = get;
            for (let index of data) {
                if (index) {
                    for (let i of index.medias) {
                        if (i.type_media === "article") {
                            this.result.push({
                                _id: i.resource_id || (0, uuid_1.v4)(),
                                id: i.resource_id,
                                "url-notice": i.url,
                                title: i.title,
                                subTitle: "",
                                category: i.section_name,
                                image: i.image,
                                "image-type": "",
                                type: i.type_media,
                                author: "",
                                date: (0, moment_1.default)().toISOString(),
                                source: wordpres_1.default.response.r7.source,
                                "url-source": wordpres_1.default.response.r7.url
                            });
                        }
                    }
                }
            }
            return this;
        }
        catch (_) {
            if (this.raw)
                return console.log(`[x] ERROR GET ARTICLES {R7}`), this;
        }
    }
    async isGetContentR7(id) {
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id))
            return new Error("ID article invalid");
        try {
            let get = await (0, axios_1.default)({
                url: wordpres_1.default.baseUrl.r7 + "/article/" + id,
                method: "GET",
                timeout: wordpres_1.default.timeoutRequest || 10 * 10 * 100
            });
            let { data } = get, { content } = data;
            let response = {
                _id: (0, uuid_1.v4)(),
                id: data.section_id,
                "url-notice": data.shortened_url || `http://${data.url}` || "",
                title: data.title,
                subTitle: data.subtitle || "",
                metas: data.title.split(' ').filter($ => $.length > 3) || [],
                image: data.cover_image || "",
                "image-type": "image/jpg",
                author: data.author,
                premium: false,
                content: this.resolveContentR7(content),
                date: data.created_at || (0, moment_1.default)().toISOString(),
                language: "pt",
                status: true,
                source: wordpres_1.default.response.r7.source,
                "url-source": wordpres_1.default.response.r7.url
            };
            return this.content = response, response;
        }
        catch (_) {
            if (this.raw)
                console.log(`[x] ERROR GET CONTENT {R7}`);
            let response = new Error("error get content");
            if (_.response && _.response.status === 404)
                response = new Error("article not exist or desabled");
            return this.content = response, response;
        }
    }
    async isGetArticleG1() {
        if (!this.starting)
            return this;
        let c = this.resolve_category(this.category, "g1");
        try {
            let get = await (0, axios_1.default)({
                url: wordpres_1.default.baseUrl.g1 + "/feed/" + c,
                method: "GET",
                timeout: wordpres_1.default.timeoutRequest || 10 * 10 * 100
            });
            let { data } = get, { feed } = data, { falkor } = feed, { items } = falkor;
            function imgResolve(objection) {
                if (!objection)
                    return "";
                let preference = ["L", "M", "S", "V"];
                let keys = Object.keys(objection);
                let r = keys.filter(e => preference.includes(e));
                if (r.length > 0) {
                    return objection[r[0]].url;
                }
                else {
                    return "";
                }
            }
            for (let index of items) {
                let { content } = index;
                if (index && content && index.type === 'materia' && !content.video) {
                    try {
                        this.result.push({
                            _id: index.id || (0, uuid_1.v4)(),
                            id: content.url,
                            "url-notice": content.url,
                            title: content.title,
                            subTitle: content.summary || "",
                            category: content.chapeu.label || content.chapeu.section || "",
                            image: content.image ? imgResolve(content.image.sizes) : "",
                            "image-type": "",
                            author: "",
                            date: index.created || index.publication || (0, moment_1.default)().toISOString(),
                            type: index.type || "",
                            source: wordpres_1.default.response.g1.source,
                            "url-source": wordpres_1.default.response.g1.url
                        });
                    }
                    catch (_) { }
                }
            }
            return this;
        }
        catch (_) {
            if (this.raw)
                return console.log(`[x] ERROR GET ARTICLES {G1}`), this;
        }
    }
    async isGetContentG1(id) {
        if (!id || !id.match("globo.com/") || id.indexOf('https') !== 0)
            return new Error("ID article invalid");
        let options_url = id.split('/')[2] === "ge.globo.com" ? "ge_raw" : "g1_raw", options_id = id.split('/')[2] === "ge.globo.com" ? id.split('https://ge.globo.com/').join('') : id;
        try {
            let get = await (0, axios_1.default)({
                url: wordpres_1.default.baseUrl[options_url] + "/" + options_id,
                method: "GET",
                timeout: wordpres_1.default.timeoutRequest || 10 * 10 * 100
            });
            let { data } = get, { resource } = data, img = this.resolve_photoG1(resource.bodyData);
            let response = {
                _id: (0, uuid_1.v4)(),
                id: resource.id,
                "url-notice": id,
                title: resource.title,
                subTitle: resource.subtitle || "",
                metas: resource.title.split(' ').filter($ => $.length > 3) || [],
                image: img.url,
                "image-type": img.type,
                author: resource.creator || "",
                premium: false,
                content: this.resolve_contentG1(resource.bodyData),
                date: resource.created || (0, moment_1.default)().toISOString(),
                language: "pt",
                status: resource.status.type || resource.status.name || resource.status.slug || true,
                source: wordpres_1.default.response.g1.source,
                "url-source": wordpres_1.default.response.g1.url
            };
            return this.content = response, response;
        }
        catch (_) {
            if (this.raw)
                console.log(`[x] ERROR GET CONTENT {G1}`);
            let response = new Error("error get content");
            if (_.response && _.response.status === 404)
                response = new Error("article not exist or desabled");
            return this.content = response, response;
        }
    }
    async isGetArticleElPais() {
        if (!this.starting)
            return this;
        let c = this.resolve_category(this.category, "elpais");
        try {
            let get = await (0, axios_1.default)({
                url: wordpres_1.default.baseUrl.elpais + "/list/ep/site/brasil.elpais.com/" + c,
                method: "GET",
                headers: {
                    "User-Agent": "ElPais/2.12.3(android)",
                    "Accept": "application/json",
                    "x-api-key": wordpres_1.default.key.elpais
                },
                timeout: wordpres_1.default.timeoutRequest || 10 * 10 * 100
            });
            let { data } = get, { content } = data;
            for (let index of content) {
                if (index && index.type === "story" && index.uri) {
                    try {
                        this.result.push({
                            _id: index.id || (0, uuid_1.v4)(),
                            id: index.uri,
                            'url-notice': index.uri,
                            title: index.headlines.title,
                            subTitle: index.headlines.subTitle,
                            category: c,
                            image: index.metas.thumbnail.uri,
                            'image-type': index.metas.thumbnail["mime-type"],
                            author: index.author[0].tagAuthor.name,
                            date: (0, moment_1.default)().toISOString(),
                            type: index.type,
                            source: wordpres_1.default.response.elpais.source,
                            'url-source': wordpres_1.default.response.elpais.url
                        });
                    }
                    catch (_) { }
                }
            }
            return this;
        }
        catch (_) {
            if (this.raw)
                return console.log(`[x] ERROR GET ARTICLES {EL PAIS}`), this;
        }
    }
    async isGetContentElPais(id) {
        if (!id || id.indexOf("https://brasil.elpais.com/") !== 0)
            return new Error("ID article invalid");
        try {
            let get = await (0, axios_1.default)({
                url: wordpres_1.default.baseUrl.elpais + "/assets/?uri=" + id,
                method: "GET",
                headers: {
                    "User-Agent": "ElPais/2.12.3(android)",
                    "Accept": "application/json",
                    "x-api-key": wordpres_1.default.key.elpais
                },
                timeout: wordpres_1.default.timeoutRequest || 10 * 10 * 100
            });
            let { data } = get, { headlines, metas, author } = data;
            let response = {
                _id: (0, uuid_1.v4)(),
                id: data.id,
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
                date: (0, moment_1.default)().toISOString(),
                language: data.language,
                status: data.status || true,
                source: wordpres_1.default.response.elpais.source,
                'url-source': wordpres_1.default.response.elpais.url
            };
            return this.content = response, response;
        }
        catch (_) {
            if (this.raw)
                console.log(`[x] ERROR GET CONTENT {EL PAIS}`);
            let response = new Error("error get content");
            if (_.response && _.response.status === 370)
                response = new Error("article not exist or desabled");
            return this.content = response, response;
        }
    }
    resolve_category(param, type) {
        return wordpres_1.default.category.obj[type][param] ? wordpres_1.default.category.obj[type][param] : wordpres_1.default.category.primary[type];
    }
    resolve_intitle() {
        if (this.result && this.result.length > 0 && this.intitle) {
            this.result = this.result.filter(_ => {
                if (_.title) {
                    let fit = this.intitle.split(' ');
                    return _.title.split(' ').some(e => {
                        e = (0, text_1.clearSpecialsText)(e);
                        return fit.includes(e);
                    });
                }
            });
        }
        return this;
    }
    resolve_limit() {
        if (this.limit && this.limit > 0) {
            this.resolve_shuffleArray(this.result, (res) => {
                this.result = res.slice(0, this.limit);
            });
        }
        return this;
    }
    resolve_shuffleArray(array, cb) {
        var length = array.length;
        var shuffled = Array(length);
        for (var index = 0, rand; index < length; index++) {
            rand = Math.floor(Math.random() * (index - 1));
            if (rand !== index)
                shuffled[index] = shuffled[rand];
            shuffled[rand] = array[index];
        }
        cb(shuffled);
        return this;
    }
    resolve_contentElPais(content, preference) {
        let body = [];
        for (let indice of content) {
            if (indice && indice.name === "body") {
                let { elements: emt } = indice;
                for (let element of emt) {
                    if (element && element.elementType === "elementParagraph") {
                        let { content: paragraph, tag } = element;
                        if (preference.removeTag)
                            paragraph = this.removeTag(paragraph, "a");
                        paragraph = this.addTag(paragraph, tag);
                        if (!paragraph.match("receber a newsletter")) {
                            body.push(paragraph);
                        }
                        ;
                    }
                    if (element && element.elementType === "photoExtension" && !element.primary) {
                        if (preference.photoToBody) {
                            let rampUp = [], { photo } = element, { image, caption, author } = photo;
                            if (preference.captionPhotoBody) {
                                rampUp.push("<figure>");
                            }
                            rampUp.push(`<img src="${image.uri}" alt="${caption}">`);
                            if (preference.captionPhotoBody || preference.authorPhotoBody) {
                                rampUp.push("<figcaption>");
                                if (caption) {
                                    rampUp.push(caption);
                                    rampUp.push(' - ');
                                }
                                if (preference.authorPhotoBody && author && typeof author === "string") {
                                    rampUp.push("<figauthor>");
                                    rampUp.push(author);
                                    rampUp.push("</figauthor>");
                                }
                                rampUp.push("</figcaption>");
                                rampUp.push("</figure>");
                            }
                            if (rampUp && rampUp.length > 0)
                                body.push(rampUp.join('').trim());
                        }
                    }
                }
            }
        }
        return body.join('').trim();
    }
    removeTag(body, tag) {
        if (!body || !tag)
            return "";
        let $ = (0, cheerio_1.load)(body), target = $(tag).attr(), remove = $(tag);
        for (let t in target) {
            remove.removeAttr(t);
        }
        var text = $.html();
        const rF = ["html", "body", tag, "head"];
        for (let r of rF) {
            text = text.replace(new RegExp("<" + r + ">", "gi"), "").replace(new RegExp("</" + r + ">", "gi"), "");
        }
        ;
        return text;
    }
    addTag(body, tag) {
        if (!tag)
            return body;
        let res = [];
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
    resolve_photoG1(array) {
        try {
            if (!array.blocks)
                throw new Error();
            let { blocks } = array;
            let response = {
                url: "",
                type: ""
            };
            for (let indice of blocks) {
                if (indice.type === "atomic" && indice.data) {
                    let { data } = indice;
                    if (data.type === "backstage-photo") {
                        response.url = data.file.thumborUrl;
                        response.type = data.file.type;
                    }
                    else if (data.type === "backstage-video") {
                        response.url = data.videoMetadata.thumb;
                        response.type = "image/" + data.videoMetadata.thumb.split('.')[data.videoMetadata.thumb.split('.').length - 1];
                    }
                }
            }
            ;
            return response;
        }
        catch (_) {
            return { url: "", type: "" };
        }
    }
    resolve_contentG1(blocks) {
        if (!blocks)
            return "";
        return (0, draftToHtml_1.draftToHtml)(blocks).trim().replace(/\n|\r/g, "");
    }
    resolveContentR7(body) {
        if (!body)
            return "";
        try {
            if (typeof body === "object") {
                body = body[0].article;
            }
            else {
                body = body.article;
            }
            return this.removeTag(body, "a");
        }
        catch (_) {
            return body;
        }
    }
    sourceRelation(string) {
        return wordpres_1.default.sources.includes(string);
    }
    sources() { return wordpres_1.default.sources; }
}
exports.CoreWordPress = CoreWordPress;

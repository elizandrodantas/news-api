"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.News = void 0;
const moment_1 = __importDefault(require("moment"));
const Wordpress_1 = require("../core/Wordpress");
const prisma_1 = require("../database/prisma");
const wordpres_1 = __importDefault(require("../config/wordpres"));
const uuid_1 = require("uuid");
class News {
    async listArticle(category, intitle, limit, source) {
        let init = (0, moment_1.default)();
        let controller = new Wordpress_1.CoreWordPress({
            category,
            intitle,
            limit,
            raw: true
        }).start();
        try {
            if (source) {
                if (typeof source === "string") {
                    if (source === "g1")
                        await controller.isGetArticleG1();
                    if (source === "r7")
                        await controller.isGetArticleR7();
                    if (source === "elpais")
                        await controller.isGetArticleElPais();
                }
                else if (typeof source === "object") {
                    for (let indice of source) {
                        indice = indice.trim();
                        if (indice === "g1")
                            await controller.isGetArticleG1();
                        if (indice === "r7")
                            await controller.isGetArticleR7();
                        if (indice === "elpais")
                            await controller.isGetArticleElPais();
                    }
                }
            }
            else {
                await controller.isGetArticleElPais();
                await controller.isGetArticleG1();
                await controller.isGetArticleR7();
            }
            let data = controller.get({ sort: true, blankLine: true });
            if (data instanceof Error)
                throw new Error(data.message);
            return {
                status: true,
                workingTime: `${(0, moment_1.default)().diff(init)} ms`,
                count: data.length,
                data
            };
        }
        catch (_) {
            return new Error(_.message);
        }
    }
    async registerStorageFuture(id, template) {
        if (!id)
            return new Error("id not declared");
        let create = await prisma_1.Prisma.storageFuture.create({
            data: { identify: id, template }
        });
        if (!create)
            return new Error("error create storage");
        return create;
    }
    async getStorageFuture(id) {
        if (!id)
            return new Error("id not declared");
        let get = await prisma_1.Prisma.storageFuture.findUnique({
            where: { id: id }
        });
        if (!get)
            return new Error("storage not exist");
        return get;
    }
    async getContentByStorage(id) {
        if (!id)
            return new Error("id storage not defined");
        if ((0, uuid_1.validate)(id)) {
            let getStorageData = await prisma_1.Prisma.storageFuture.findUnique({
                where: { id }
            });
            if (!getStorageData)
                return new Error("storage not exist");
            var { identify, template } = getStorageData;
            if (!template)
                return new Error("template invalid or not exist");
            return await this.getContentById(identify, template);
        }
        else {
            var tamplete = null;
            if (id.indexOf("https://brasil.elpais.com/") === 0 && !id.match('globo.com/'))
                tamplete = "elpais";
            if (id.indexOf("https://brasil.elpais.com/") !== 0 && id.match('globo.com/'))
                tamplete = "g1";
            if (/^[0-9a-fA-F]{24}$/.test(id))
                tamplete = "r7";
            if (tamplete === null)
                return new Error("source not exist");
            return await this.getContentById(id, tamplete);
        }
    }
    async getContentById(id, template) {
        if (!id)
            return new Error("id content not defined");
        if (!template)
            return new Error("template content not defined");
        let controller = new Wordpress_1.CoreWordPress({ raw: true }).start();
        try {
            if (template === "g1")
                await controller.isGetContentG1(id);
            if (template === "r7")
                await controller.isGetContentR7(id);
            if (template === "elpais")
                await controller.isGetContentElPais(id);
            return controller.getContent();
        }
        catch (e) {
            return new Error(e.message || "error get content by id");
        }
    }
    async getOptionsCategory(source) {
        try {
            let response = {
                data: []
            };
            if (source) {
                if (typeof source === "string") {
                    source = source.split(',');
                }
                if (typeof source === "object") {
                    for (let i of source) {
                        if (i === "r7") {
                            response.data.push({
                                name: "R7",
                                data: wordpres_1.default.category.array.r7
                            });
                        }
                        if (i === "g1") {
                            response.data.push({
                                name: "G1",
                                data: wordpres_1.default.category.array.g1
                            });
                        }
                        if (i === "elpais") {
                            response.data.push({
                                name: "EL PAIS BRASIL",
                                data: wordpres_1.default.category.array.elpais
                            });
                        }
                    }
                }
            }
            else {
                response.data.push({
                    name: "EL PAIS",
                    data: wordpres_1.default.category.array.elpais
                });
                response.data.push({
                    name: "G1",
                    data: wordpres_1.default.category.array.g1
                });
                response.data.push({
                    name: "R7",
                    data: wordpres_1.default.category.array.r7
                });
            }
            return response;
        }
        catch (_) {
            return new Error("error get list categories");
        }
    }
}
exports.News = News;

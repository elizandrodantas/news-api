import moment from "moment";
import { CoreWordPress } from "../core/Wordpress";
import { Prisma } from "../database/prisma";
import { StorageFuture } from "@prisma/client";
import config from '../config/wordpres';

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

interface iResponseListAll {
    status: boolean;
    workingTime: string;
    count: number;
    data: iResponsePatternFormat[]
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

export class News {
    async listArticle(category?: string, intitle?: string, limit?: number, source?: string | string[]): Promise<Error | iResponseListAll>{
        let init = moment();
        
        let controller = new CoreWordPress({
            category,
            intitle,
            limit,
            raw: true
        }).start();
        
        try{
            if(source){
                if(typeof source === "string"){
                    if(source === "g1") await controller.isGetArticleG1();
                    if(source === "r7") await controller.isGetArticleR7();
                    if(source === "elpais") await controller.isGetArticleElPais();
                }else if(typeof source === "object"){
                    for(let indice of source){
                        indice = indice.trim();
                        if(indice === "g1") await controller.isGetArticleG1();
                        if(indice === "r7") await controller.isGetArticleR7();
                        if(indice === "elpais") await controller.isGetArticleElPais();
                    }
                }
            }else{
                await controller.isGetArticleElPais();
                await controller.isGetArticleG1();
                await controller.isGetArticleR7();
            }

            let data = controller.get({ sort: true, blankLine: true });
            if(data instanceof Error) throw new Error(data.message);

            return {
                status: true,
                workingTime: `${moment().diff(init)} ms`,
                count: data.length,
                data
            };
        }catch(_){
            return new Error(_.message);
        }
    }

    async registerStorageFuture(id: string, template?: string): Promise<Error | StorageFuture>{
        if(!id) return new Error("id not declared");

        let create = await Prisma.storageFuture.create({
            data: { identify: id, template }
        });

        if(!create) return new Error("error create storage");

        return create;
    }

    async getStorageFuture(id: string): Promise<Error | StorageFuture>{
        if(!id) return new Error("id not declared");

        let get = await Prisma.storageFuture.findUnique({
            where: { id: id }
        });

        if(!get) return new Error("storage not exist");

        return get;
    }

    async getContentByStorage(id: string): Promise<Error | iResponseContentFormat>{
        if(!id) return new Error("id storage not defined");

        let getStorageData = await Prisma.storageFuture.findUnique({
            where: { id }
        });
        if(!getStorageData) return new Error("storage not exist");

        let { identify, template } = getStorageData;

        if(!template) return new Error("template invalid or not exist");

        return await this.getContentById(identify, template);
    }

    async getContentById(id: string, template: string): Promise<Error | iResponseContentFormat>{
        if(!id) return new Error("id content not defined");
        if(!template) return new Error("template content not defined");

        let controller = new CoreWordPress({ raw: true }).start();

        try{
            if(template === "g1") await controller.isGetContentG1(id);
            if(template === "r7") await controller.isGetContentR7(id);
            if(template === "elpais") await controller.isGetContentElPais(id);

            return controller.getContent()
        }catch(e: any){
            return new Error(e.message || "error get content by id");
        }
    }

    async getOptionsCategory(source?: "r7" | "g1" | "elpais" | string[] | any){
        try{
            let response: {
                data: {name: string, data: string[]}[]
            } = {
                data: []
            }

            if(source){
                if(typeof source === "string"){
                    source = source.split(',');
                }

                if(typeof source === "object"){
                    for(let i of source){
                        if(i === "r7"){
                            response.data.push({
                                name: "R7",
                                data: config.category.array.r7
                            });
                        }
        
                        if(i === "g1"){
                            response.data.push({
                                name: "G1",
                                data: config.category.array.g1
                            });
                        }
        
                        if(i === "elpais"){
                            response.data.push({
                                name: "EL PAIS BRASIL",
                                data: config.category.array.elpais
                            });
                        }
                    }
                }
            }else{
                response.data.push({
                    name: "EL PAIS BRASIL",
                    data: config.category.array.elpais
                });
                response.data.push({
                    name: "G1",
                    data: config.category.array.g1
                });
                response.data.push({
                    name: "R7",
                    data: config.category.array.r7
                });
            }

            return response;
        }catch(_){
            return new Error("error get list categories");
        }
    }
}
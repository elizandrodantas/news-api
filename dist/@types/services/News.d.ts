import { StorageFuture } from "@prisma/client";
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
    data: iResponsePatternFormat[];
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
export declare class News {
    listArticle(category?: string, intitle?: string, limit?: number, source?: string | string[]): Promise<Error | iResponseListAll>;
    registerStorageFuture(id: string, template?: string): Promise<Error | StorageFuture>;
    getStorageFuture(id: string): Promise<Error | StorageFuture>;
    getContentByStorage(id: string): Promise<Error | iResponseContentFormat>;
    getContentById(id: string, template: string): Promise<Error | iResponseContentFormat>;
    getOptionsCategory(source?: "r7" | "g1" | "elpais" | string[] | any): Promise<Error | {
        data: {
            name: string;
            data: string[];
        }[];
    }>;
}
export {};

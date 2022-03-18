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
interface iParamGet {
    sort?: boolean;
    blankLine?: boolean;
}
export declare class CoreWordPress {
    options?: iGetArticleManyOptions;
    constructor(options?: iGetArticleManyOptions);
    private category;
    private raw;
    private limit;
    private intitle;
    private starting;
    private result;
    private content;
    start(): this;
    get(param?: iParamGet): iResponsePatternFormat[] | Error;
    getContent(): iResponseContentFormat | Error;
    isGetArticleR7(): Promise<this>;
    isGetContentR7(id: string): Promise<Error | iResponseContentFormat>;
    isGetArticleG1(): Promise<this>;
    isGetContentG1(id: string): Promise<Error | iResponseContentFormat>;
    isGetArticleElPais(): Promise<this>;
    isGetContentElPais(id: string): Promise<Error | iResponseContentFormat>;
    private resolve_category;
    resolve_intitle(): this;
    resolve_limit(): this;
    private resolve_shuffleArray;
    private resolve_contentElPais;
    private removeTag;
    private addTag;
    private resolve_photoG1;
    private resolve_contentG1;
    private resolveContentR7;
    sourceRelation(string: string): boolean;
    sources(): any;
}
export {};

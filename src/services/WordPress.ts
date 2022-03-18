import { User, WordPress, WordPress_Publish } from "@prisma/client";
import axios from "axios";
import moment, { invalid } from "moment";
import { Prisma } from "../database/prisma";
import { toBase64, toUtf8 } from '../util/base64';
import WPAPI from 'wpapi';
import crypto from 'crypto';
import { News } from "./News";
import uid2 from 'uid2';
import { v4 as uuidv4 } from 'uuid';
import { QueueServicePattern } from "../jobs/QueueService";
import { CoreWordPress } from "../core/Wordpress";
import { throws } from "assert";

interface iPayloadAdd {
    username: string;
    password: string;
}

interface iPayloadLogin {
    status: boolean;
    token: string;
    email: string;
    name: string;
    display_name: string;
}

interface iPayloadInfo {
    name: string;
    description: string;
    services: string;
    acceptService: string;
    uri: string;
}

interface iPayloadParams extends iPayloadAdd{ 
    url: string;
}

interface iResponseWpOption {
    id: number;
    count: number;
    description: string;
    link: string;
    name: string;
    slug: string;
    parent: string;
    meta: string[]
}

interface iPayloadOptionsAddImage {
    author?: number;
    status: "publish" | "future" | "draft" | "pending" | "private";
    caption?: string;
    description?: string;
    post_id?: number;
    url: string;
}

interface iResponseAddImage {
    status: "publish" | "future" | "draft" | "pending" | "private";
    updated: boolean;
    associated: boolean;
    postAssociated: number;
    imageId: number;
    imageUrl: string;
    title: string;
}

interface iResponseStatus {
    status: boolean;
    count: number;
    data: WordPress[]
}

interface iPayloadNewPost {
    id: string;
    media_id: number;
    category: number[];
    status: "publish" | "future" | "pending" | "private";
    password?: string;
}

interface iResponseStatusService {
    service: string;
    status: boolean;
    responseTime: number;
    responseTimeType: string;
}


export class Service_WordPress {
    url: string;
    username: string;
    password: string;
    service_status: boolean;
    bearer: string;

    constructor(
        public userId: string,
        public serviceId?: string
    ){}

    async status(): Promise<iResponseStatus | Error>{
        if(!this.userId) return new Error("user not identify");

        let user = await Prisma.user.findUnique({
            where: { id: this.userId },
            include: { service_wordpress: true }
        });

        if(!user) return new Error("user not exist");
        
        let { service_wordpress } = user;

        let onlyActive = service_wordpress.filter($ => $.status);

        if(onlyActive.length <= 0) return new Error("service is not configured or does not exist");

        return {
            status: true,
            count: service_wordpress.length,
            data: service_wordpress
        }
    }

    async add(url: string, { username, password}: iPayloadAdd){
        if(!this.userId) return new Error("user not identify");

        if(!username || !password) return new Error("username or password invalid");

        let login = await this.login(url, username, password);
        if(login instanceof Error) return new Error(login.message);

        let userExist = await Prisma.user.findUnique({
            where: { id: this.userId }
        });
        if(!userExist) return new Error("user not exist");

        let uri = this.util_getUri(url);

        let serviceExist = await Prisma.wordPress.findFirst({
            where: { uri, userId: this.userId }
        });
        if(serviceExist) return new Error("service already assigned the user");

        let { email } = login;

        let create = await Prisma.wordPress.create({
            data: {
                userId: this.userId,
                uri,
                wordpress_email: email,
                wordpress_user: toBase64(username),
                wordpress_pass: toBase64(password),
                wordpress_url: url
            }
        });

        if(!create) return new Error("error create wordpress service");

        return create;
    }

    async edit(param: iPayloadParams): Promise<Error | WordPress>{
        if(!this.userId || !this.serviceId) return new Error(!this.serviceId ? "service" : "user" + " " + "not identify");

        let { username, password, url } = param;

        let login = await this.login(url, username, password);
        if(login instanceof Error) return new Error(login.message);

        let uri = this.util_getUri(url), { email } = login;
    
        let userRelated = await Prisma.wordPress.findFirst({
            where: {
                id: this.serviceId,
                userId: this.userId
            }
        });

        if(!userRelated) return new Error("no user related service");

        let edit = await Prisma.wordPress.update({
            where: { id: this.serviceId },
            data: {
                wordpress_user: toBase64(username),
                wordpress_pass: toBase64(password),
                wordpress_email: email,
                wordpress_url: url,
                uri,
                status: true
            }
        });
        
        if(!edit) return new Error("error edit service wordpress");

        return edit;
    }

    async delete(): Promise<Error | {status: boolean; id: string; deleted: string}>{
        if(!this.userId || !this.serviceId) return new Error(!this.serviceId ? "service" : "user" + " " + "not identify");

        let verifyExist = await Prisma.wordPress.findFirst({
            where: {
                id: this.serviceId,
                userId: this.userId
            }
        });

        if(!verifyExist) return new Error("no user related service or service not exist");

        let remove = await Prisma.wordPress.delete({
            where: {
                id: this.serviceId
            }
        });
        
        if(!remove) return new Error("error deleting service");

        return {
            status: true,
            id: this.serviceId,
            deleted: moment().toISOString()
        };
    }

    async login(url: string, username: string, password: string): Promise<Error | iPayloadLogin>{
        if(!url) return new Error("site not exist");
        if(!username || !password) return new Error("username or password invalid");

        if(url.split('/').length !== 3 && url.split('/').length !== 4 || url.split('.').length <= 1) return new Error("invalid url format, expected format: protocol://yousite.com");
        
        let pathLogin = url.split('/').length === 4 ? "wp-json/jwt-auth/v1/token" : "/wp-json/jwt-auth/v1/token";

        try{
            let auth = await axios({
                url: url + pathLogin,
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    username,
                    password
                })
            });

            let { data } = auth, { token, user_email, user_nicename, user_display_name } = data;

            return this.bearer = token, {
                status: true,
                token,
                email: user_email,
                name: user_nicename,
                display_name: user_display_name
            }
        }catch(error: any){
            if(error.response.status === 403) return new Error("not authenticated by service");

            return new Error("error authenticating to service");
        }
    }

    async getInfoService(url: string): Promise<Error | iPayloadInfo>{
        if(!url) return new Error("site not exist");

        if(url.split('/').length !== 3 && url.split('/').length !== 4 || url.split('.').length <= 1) return new Error("invalid url format, expected format: protocol://yousite.com");

        let pathLogin = url.split('/').length === 4 ? "wp-json" : "/wp-json";


        try{
            let get = await axios({
                url: url + pathLogin,
                method: "GET"
            });

            let { data } = get, { name, description, namespaces, url: uri } = data;

            let acceptService = namespaces.some(i => i.match("jwt-auth"));

            return {
                name, description, services: namespaces, acceptService, uri: uri.split('/')[2]
            }
        }catch(error: any){
            return new Error("error get info service");
        }
    }

    async getToken(): Promise<Error | iPayloadLogin>{
        if(!this.userId || !this.serviceId) return new Error(!this.serviceId ? "service" : "user" + " " + "not identify");

        let getInfo = await Prisma.wordPress.findFirst({
            where: { id: this.serviceId, userId: this.userId }
        });

        if(!getInfo) return this.service_status = false, new Error("service not register");

        let { wordpress_url, wordpress_user, wordpress_pass, status } = getInfo;

        if(!status) return this.service_status = false, new Error("the service is not working, try edict to confirm the functionality");

        wordpress_user = toUtf8(wordpress_user);
        wordpress_pass = toUtf8(wordpress_pass);
    
        let login = await this.login(wordpress_url, wordpress_user, wordpress_pass);
        if(login instanceof Error) return this.updatedStatusService(this.serviceId, false), this.service_status = false, new Error(login.message);

        return this.url = wordpress_url, this.username = wordpress_user, this.password = toBase64(wordpress_pass), this.service_status = true, login
    }

    // ****** RESOLVE GET OPTIONS WORDPRESS ****** //

    async getTaxonomies(type?: "post_tag" | "category"): Promise<Error | iResponseWpOption>{
        if(!this.userId || !this.serviceId) return new Error(!this.serviceId ? "service" : "user" + " " + "not identify");
        if(type && type !== "post_tag" && type !== "category") return new Error("type taxanomies invalid, expected type: post_tag, category");

        let service = await Prisma.wordPress.findFirst({
            where: {
                id: this.serviceId
            }
        });

        if(!service) return new Error("service not exist");
        
        let { wordpress_url, userId: client_id } = service;

        if(this.userId !== client_id) return new Error("user does not belong to the service");

        let pathLogin = wordpress_url.split('/').length === 4 ? "wp-json" : "/wp-json", uri = type && type === "category" ? "categories" : type && type === "post_tag" ? "tags" : "taxonomies";

        try{
            let get = await axios({
                url: wordpress_url + pathLogin + "/wp/v2/" + uri,
                method: "GET"
            });

            let { data } = get;

            return data;
        }catch(error: any){
            return new Error(`error get ${!type ? "taxonomies" : type}`);
        }
    }

    // ****** RESOLVE ADD OPTIONS WORDPRESS ****** //

    async addTaxonomies({name, description}: { name: string[]; description?: string[]}, type: "post_tag" | "category"): Promise<Error | iResponseWpOption[] & {error?: string; status: boolean}[]>{
        if(!this.userId || !this.serviceId) return new Error(!this.serviceId ? "service" : "user" + " " + "not identify");
        if(type !== "post_tag" && type !== "category") return new Error("type taxanomies invalid, expected type: post_tag, category");
        if(!name || typeof name !== "object" && typeof description !== "object") return new Error("category name not defined or format invalid");

        if(!this.bearer) return new Error("mandatory is authorized in the service");
        if(!this.service_status) return new Error("the service is not working, try edict to confirm the functionality");

        let pathLogin = this.url.split('/').length === 4 ? "wp-json" : "/wp-json", uri = type && type === "category" ? "categories" : "tags";

        try{
            let response: iResponseWpOption[] & {error?: string; status: boolean}[] = []

            for(let i = 0, d = ""; i < name.length; i++){
                d = description[i] ? description[i] : "";
                if(typeof name[i] === "string" || description[i] && typeof description[i] === "string"){
                    try{
                        let add = await axios({
                            url: this.url + pathLogin + '/wp/v2/' + uri,
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                authorization: "Bearer " + this.bearer
                            },
                            data: JSON.stringify({
                                name: name[i],
                                description: d,
                                slug: name[i].split(' ').join('-')
                            })
                        });

                        let { data } = add;

                        data._links = undefined;
                        data.status = true;

                        response.push(data);
                    }catch(error: any){
                        if(error.response.status === 403){
                            response.push({
                                error: "not authorized service",
                                status: false
                            });
                        }else if(error.response.status === 400){
                            response.push({
                                error: error.response.data.message || "unknown error",
                                status: false
                            });
                        }else{
                            response.push({
                                error: "unknown error",
                                status: false
                            });
                        }
                    }
                }else{
                    response.push({
                        error: type + " name type must be a string",
                        status: false
                    })
                }
            }

            return response
        }catch(error: any){
            return new Error("unknown error");
        }
    }

    // ****** RESOLVE IMAGEM ****** //

    async addImage(options: iPayloadOptionsAddImage): Promise<Error | iResponseAddImage>{
        if(!this.serviceId || !this.userId) return new Error("service not defined");
        if(!this.bearer) return new Error("mandatory is authorized in the service");
        if(!this.service_status) return new Error("the service is not working, try edict to confirm the functionality");
        
        let { status, description, author, url, caption, post_id } = options;

        if(post_id && typeof post_id !== "number") return new Error("post id invalid");
        if(!url) return new Error("url image not defined");
        if(!status) status = "pending";

        let pathLogin = this.url.split('/').length === 4 ? "wp-json" : "/wp-json";

        let title = `robot-${uuidv4().split('-').join('')}`;

        let json: any = {
            title,
            status
        };

        if(description) json.description = description;
        if(author) json.author = author;
        if(caption) json.caption = caption;

        try{
            let get_image = await axios({
                url,
                method: "GET",
                responseType: "arraybuffer"
            });

            let { data: data_get_image } = get_image, image_type = get_image.headers['content-type'].split('/')[1], image_name = this.generatedImageName() + '.' + image_type;

            let controller_wp = new WPAPI({ endpoint: this.url + pathLogin });

            try{
                let addMedia = await controller_wp.media().file(data_get_image, image_name).setHeaders({ authorization: "Bearer " + this.bearer }).create(json);

                if(post_id && typeof post_id === 'number'){
                    try{
                        await controller_wp.media().setHeaders({ authorization: "Bearer " + this.bearer }).id(addMedia.id).update({
                            post: post_id
                        })
        
                        return {
                            status,
                            title,
                            updated: true,
                            associated: true,
                            postAssociated: post_id,
                            imageId: addMedia.id,
                            imageUrl: addMedia.source_url
                        }
                    }catch(error: any){
                        return {
                            status,
                            title,
                            updated: true,
                            associated: false,
                            postAssociated: null,
                            imageId: addMedia.id,
                            imageUrl: addMedia.source_url
                        }
                    }
                }else{
                    return {
                        status,
                        title,
                        updated: true,
                        associated: false,
                        postAssociated: null,
                        imageId: addMedia.id,
                        imageUrl: addMedia.source_url
                    }
                }
            }catch(error: any){
                return new Error("error sending media");
            }
        }catch(error: any){
            return new Error("image not exist or not permission access");
        }
    }

    // ****** RESOLVE POST ****** //

    async addPost(params: iPayloadNewPost){
        if(!this.bearer) return new Error("mandatory is authorized in the service");
        if(!this.service_status) return new Error("the service is not working, try edict to confirm the functionality");
        if(!this.url) return new Error("endpoint not defined");

        let { status, password, category, id, media_id } = params;

        if(!status) status = "pending";
        if(category && typeof category === "object")category = category.filter(e => typeof e === "number");
        if(!id) return new Error("id storage not defined");
        if(media_id && typeof media_id !== "number") return new Error("a number in the id_media is expected");

        let content = await new News().getContentByStorage(id);
        if(content instanceof Error) return new Error(content.message);
  
        let { title, content: isContent, metas, id: id_article, subTitle } = content, pathLogin = this.url.split('/').length === 4 ? "wp-json" : "/wp-json";

        try{
            let taskId = uid2(32);

            QueueServicePattern(this.jobAddPost({
                    userId: this.userId,
                    storage_register: id,
                    id_article,
                    title,
                    publish_status: status,
                    publish_password: password,
                    subTitle,
                    taskId,
                    metas,
                    media_id,
                    category,
                    content: isContent,
                    endpoint: this.url + pathLogin
            }));

            return {
                status: 'processing',
                createdAt: moment().toISOString(),
                taskId,
                titlePublish: title,
                storage_id: id
            }
        }catch(_){
            return new Error("error start create post");
        }
    }

    private async jobAddPost(params: {
        userId: string;
        storage_register: string;
        id_article: string;
        title: string;
        publish_status: "publish" | "future" | "draft" | "pending" | "private";
        publish_password: string | null;
        subTitle?: string;
        taskId: string;
        category: number[];
        metas: string[] | any;
        media_id: number;
        content: string;
        endpoint: string;
    }){
        try{
            let json: any = {};
            json.publish_password = params.publish_status ? params.publish_password : null;
            json.userId = params.userId;
            json.storage_register = params.storage_register;
            json.id_article = params.id_article;
            json.title = params.title ? params.title : "";
            json.publish_status = params.publish_status ? params.publish_status : "";
            json.subTitle = params.subTitle ? params.subTitle : null; 
            json.taskId = params.taskId;
            json.service_id = this.serviceId;
            
            let start = await Prisma.wordPress_Publish.create({
                data: json
            });

            if(!start) return console.log(`[x] ERROR STARTING JOB - *****I****`);

            let tags = [], controller_wp = new WPAPI({ endpoint: params.endpoint });

            if(params.metas && typeof params.metas === 'object' && params.metas.length > 0){
                for(let i of params.metas){
                    try{
                        await controller_wp.tags().setHeaders({authorization: "Bearer " + this.bearer}).create({name: i});
                    }catch(_){}
                }

                await controller_wp.tags().slug(params.metas).then(e => {
                    if(e && typeof e === "object"){
                        e.map($ => {
                            if($ && $.id){
                                tags.push($.id)
                            }
                        })
                    }
                })
            }

            json = {};

            json.title = params.title ? params.title : "";
            json.content = params.content ? params.content : "";
            json.status = params.publish_status ? params.publish_status : "future";
            if(tags.length > 0) json.tags = tags;
            if(params.category && typeof params.category === "object") json.categories = params.category;
            if(params.media_id && typeof params.media_id === "number")json.featured_media = params.media_id;
            if(params.publish_password) json.password = params.publish_password;
     
            await controller_wp.posts().setHeaders({ authorization: "Bearer " + this.bearer }).create(json)
            .then(e => {
                return this.jobUpdateStatus(params.taskId, {
                    finish: true,
                    error: false,
                    report: null,
                    postId: e.id,
                    postUrl: e.link
                })
            })
            .catch(error => {
                return this.jobUpdateStatus(params.taskId, {
                    finish: true,
                    error: true,
                    report: `error create post: ${error.message || "no response"}`
                });
            });
        }catch(_: any){
            this.jobUpdateStatus(params.taskId, {
                finish: true,
                error: true,
                report: `error in the process of creating post`
            })
        }
    }

    private async jobUpdateStatus(taskId: string, options: {finish: boolean, report: string | null, error: boolean, postId?: number, postUrl?: string}){
        if(taskId && options){
            await Prisma.wordPress_Publish.updateMany({
                where: { taskId },
                data: options
            });
        }
    }

    // ****** JOBS PUBLISH POST ***** //
    
    async getJobsWithService(): Promise<Error | { status: boolean; count: number; data: WordPress_Publish[]}>{
        if(!this.userId || !this.serviceId) return new Error("service id not defined");

        try{
            let get = await Prisma.wordPress_Publish.findMany({
                where: {
                    userId: this.userId,
                    service_id: this.serviceId
                }
            });
    
            return {
                status: true,
                count: get.length,
                data: get
            }
        }catch(e: any){
            return {
                status: false,
                count: -1,
                data: []
            }
        }
    }

    async getJobsAndServices(): Promise<Error | { status: boolean; count: number; data: WordPress[] | { service: string; count: number; jobs: WordPress_Publish[]}[]}>{
        if(!this.userId) return new Error("error internal");

        let services = await Prisma.wordPress.findMany({
            where: {
                userId: this.userId
            }
        });

        if(services.length <= 0) return {
            status: true,
            count: services.length,
            data: services
        }

        let find = [], results: { service: string; count: number; jobs: WordPress_Publish[]}[] = [];

        for(let indice of services){
            let { id } = indice;

            find.push(Prisma.wordPress_Publish.findMany({
                where: { service_id: id, userId: this.userId },
                orderBy: [{
                    createdAt: "asc"
                }]
            }));
        }

        await Promise.all(find)
        .then(e => {
            e.map(indice => {
                for(let service of services){
                    let { id } = service;

                    let r = indice.filter(e => e.service_id === id), count = 0;

                    try {count = r.length} catch(e) {}

                    results.push({
                        service: id,
                        count,
                        jobs: r
                    });
                }
            });
        });

        return {
            status: true,
            count: results.length,
            data: results
        };
    }

    async getJob(taskId: string): Promise<Error | WordPress_Publish>{
        if(!this.userId) return new Error("error internal");
        if(!taskId) return new Error("task id not defined");

        let job = await Prisma.wordPress_Publish.findFirst({
            where: { taskId, userId: this.userId },
            orderBy: [{
                createdAt: "asc"
            }]
        });

        if(!job) return new Error("task job not exist");

        return job;
    }

    // ****** UTILS ****** //

    private util_getUri(url: string): string{
        if(url && url.split('/').length !== 3 && url.split('/').length !== 4 || url.split('.').length <= 1) return url;
        
        return url.split('/')[2]
    }

    private generatedImageName(md5: string = ""): string{
        return md5 = crypto.createHash('md5').update(`${Date.now()}`).digest('hex'), `robot-${md5}`
    }

    async updatedStatusService(serviceId: string, status: boolean): Promise<void>{
        if(serviceId && typeof status === "boolean"){
            await Prisma.wordPress.update({
                where: { id: serviceId },
                data: { status }
            });
        }
    }

    async statusServices(): Promise<{ verificationTime: number; response: iResponseStatusService[]}>{
        let initVerification = moment();
        let response: iResponseStatusService[] = [];

        try{
            let controller = new CoreWordPress({
                raw: true
            }).start();

            let initG1 = moment(), g1 = await controller.isGetArticleG1().then(e => true).catch(e => false);;
            response.push({
                responseTime: moment().diff(initG1),
                responseTimeType: "ms",
                service: "g1",
                status: g1
            })
            
            let initR7 = moment(), r7 = await controller.isGetArticleG1().then(e => true).catch(e => false);;
            response.push({
                responseTime: moment().diff(initR7),
                responseTimeType: "ms",
                service: "g1",
                status: r7
            })

            let initElPais = moment(), elpais = await controller.isGetArticleG1().then(e => true).catch(e => false);;
            response.push({
                responseTime: moment().diff(initElPais),
                responseTimeType: "ms",
                service: "g1",
                status: elpais
            })

        }catch(e){console.log(e)}

        return {
            verificationTime: moment().diff(initVerification),
            response
        };
    }
}
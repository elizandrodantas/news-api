import { WordPress, WordPress_Publish } from "@prisma/client";
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
interface iPayloadParams extends iPayloadAdd {
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
    meta: string[];
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
    data: WordPress[];
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
export declare class Service_WordPress {
    userId: string;
    serviceId?: string;
    url: string;
    username: string;
    password: string;
    service_status: boolean;
    bearer: string;
    constructor(userId: string, serviceId?: string);
    status(): Promise<iResponseStatus | Error>;
    add(url: string, { username, password }: iPayloadAdd): Promise<Error | WordPress>;
    edit(param: iPayloadParams): Promise<Error | WordPress>;
    delete(): Promise<Error | {
        status: boolean;
        id: string;
        deleted: string;
    }>;
    login(url: string, username: string, password: string): Promise<Error | iPayloadLogin>;
    getInfoService(url: string): Promise<Error | iPayloadInfo>;
    getToken(): Promise<Error | iPayloadLogin>;
    getTaxonomies(type?: "post_tag" | "category"): Promise<Error | iResponseWpOption>;
    addTaxonomies({ name, description }: {
        name: string[];
        description?: string[];
    }, type: "post_tag" | "category"): Promise<Error | iResponseWpOption[] & {
        error?: string;
        status: boolean;
    }[]>;
    addImage(options: iPayloadOptionsAddImage): Promise<Error | iResponseAddImage>;
    addPost(params: iPayloadNewPost): Promise<Error | {
        status: string;
        createdAt: string;
        taskId: string;
        titlePublish: string;
        storage_id: string;
    }>;
    private jobAddPost;
    private jobUpdateStatus;
    getJobsWithService(): Promise<Error | {
        status: boolean;
        count: number;
        data: WordPress_Publish[];
    }>;
    getJobsAndServices(): Promise<Error | {
        status: boolean;
        count: number;
        data: WordPress[] | {
            service: string;
            count: number;
            jobs: WordPress_Publish[];
        }[];
    }>;
    getJob(taskId: string): Promise<Error | WordPress_Publish>;
    private util_getUri;
    private generatedImageName;
    updatedStatusService(serviceId: string, status: boolean): Promise<void>;
    statusServices(): Promise<{
        verificationTime: number;
        response: iResponseStatusService[];
    }>;
}
export {};

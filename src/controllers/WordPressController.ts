import { User, WordPress, WordPress_Publish } from "@prisma/client";
import { Request, Response } from "express";
import { Service_WordPress } from "../services/WordPress";

type iJob = Error |
        { status: boolean; count: number; data: WordPress[] |
        { service: string; count: number; jobs: WordPress_Publish[]}[]} |
        { status: boolean; count: number; data: WordPress_Publish[]}

export class WordPressController {
    async status(request: Request, response: Response){
        let { client_id } = request.decoded;

        let execute = await new Service_WordPress(client_id).status();
        if(execute instanceof Error) return response.status(404).json({error: execute.message});

        return response.status(200).json(execute)
    }

    async getJobsAndServices(request: Request, response: Response){
        let { serviceId } = request.params;
        let { client_id } = request.decoded;

        let job: iJob

        if(serviceId){
            job = await new Service_WordPress(client_id, serviceId).getJobsWithService();
        }else{
            job = await new Service_WordPress(client_id).getJobsAndServices();
        }

        if(job instanceof Error) return response.status(400).json({error: job.message});

        return response.status(200).json(job);
    }

    async jobStatus(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { taskId } = request.params

        let execute = await new Service_WordPress(client_id).getJob(taskId);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async add(request: Request, response: Response){
        let { client_id } = request.decoded; 
        let { url } = request.body;   
    
        let execute = await new Service_WordPress(client_id).add(url, request.body);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async edit(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { id } = request.params;

        let execute = await new Service_WordPress(client_id, id).edit(request.body);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    } 

    async delete(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { id } = request.body;

        let execute = await new Service_WordPress(client_id, id).delete();
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async getTag(request: Request, response: Response){
        let { service_id } = request.params;
        let { client_id } = request.decoded;

        let execute = await new Service_WordPress(client_id, service_id).getTaxonomies("post_tag");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async getCategory(request: Request, response: Response){
        let { service_id } = request.params;
        let { client_id } = request.decoded;

        let execute = await new Service_WordPress(client_id, service_id).getTaxonomies("category");
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async addTag(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { id } = request.params;
        let { name, description } = request.body;

        let controller = new Service_WordPress(client_id, id);
        let login = await controller.getToken();
        if(login instanceof Error) return response.status(401).json({error: login.message});

        let add = await controller.addTaxonomies({name, description}, 'post_tag');
        if(add instanceof Error) return response.status(400).json({error: add.message});

        return response.status(200).json(add);
    }

    async addCategory(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { id } = request.params;
        let { name, description } = request.body;

        let controller = new Service_WordPress(client_id, id);
        let login = await controller.getToken();
        if(login instanceof Error) return response.status(401).json({error: login.message});

        let add = await controller.addTaxonomies({name, description}, 'category');
        if(add instanceof Error) return response.status(400).json({error: add.message});

        return response.status(200).json(add);
    }

    async addMedia(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { id } = request.params;

        let controller_wp = new Service_WordPress(client_id, id);
        let login = await controller_wp.getToken();
        if(login instanceof Error) return response.status(401).json({error: login.message});

        let add = await controller_wp.addImage(request.body);
        if(add instanceof Error) return response.status(400).json({error: add.message});

        return response.status(200).json(add);
    }

    async addPost(request: Request, response: Response){
        let { client_id } = request.decoded;
        let { id } = request.params;

        let controller = new Service_WordPress(client_id, id);
        let login = await controller.getToken();
        if(login instanceof Error) return response.status(401).json({error: login.message});

        let execute = await controller.addPost(request.body);
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }

    async statusServices(request: Request, response: Response){
        let execute = await new Service_WordPress(request.decoded.client_id).statusServices();
        if(execute instanceof Error) return response.status(400).json({error: execute.message});

        return response.status(200).json(execute);
    }
}
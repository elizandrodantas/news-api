"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordPressController = void 0;
const WordPress_1 = require("../services/WordPress");
class WordPressController {
    async status(request, response) {
        let { client_id } = request.decoded;
        let execute = await new WordPress_1.Service_WordPress(client_id).status();
        if (execute instanceof Error)
            return response.status(404).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async getJobsAndServices(request, response) {
        let { serviceId } = request.params;
        let { client_id } = request.decoded;
        let job;
        if (serviceId) {
            job = await new WordPress_1.Service_WordPress(client_id, serviceId).getJobsWithService();
        }
        else {
            job = await new WordPress_1.Service_WordPress(client_id).getJobsAndServices();
        }
        if (job instanceof Error)
            return response.status(400).json({ error: job.message });
        return response.status(200).json(job);
    }
    async jobStatus(request, response) {
        let { client_id } = request.decoded;
        let { taskId } = request.params;
        let execute = await new WordPress_1.Service_WordPress(client_id).getJob(taskId);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async add(request, response) {
        let { client_id } = request.decoded;
        let { url } = request.body;
        let execute = await new WordPress_1.Service_WordPress(client_id).add(url, request.body);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async edit(request, response) {
        let { client_id } = request.decoded;
        let { id } = request.params;
        let execute = await new WordPress_1.Service_WordPress(client_id, id).edit(request.body);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async delete(request, response) {
        let { client_id } = request.decoded;
        let { id } = request.body;
        let execute = await new WordPress_1.Service_WordPress(client_id, id).delete();
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async getTag(request, response) {
        let { service_id } = request.params;
        let { client_id } = request.decoded;
        let execute = await new WordPress_1.Service_WordPress(client_id, service_id).getTaxonomies("post_tag");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async getCategory(request, response) {
        let { service_id } = request.params;
        let { client_id } = request.decoded;
        let execute = await new WordPress_1.Service_WordPress(client_id, service_id).getTaxonomies("category");
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async addTag(request, response) {
        let { client_id } = request.decoded;
        let { id } = request.params;
        let { name, description } = request.body;
        let controller = new WordPress_1.Service_WordPress(client_id, id);
        let login = await controller.getToken();
        if (login instanceof Error)
            return response.status(401).json({ error: login.message });
        let add = await controller.addTaxonomies({ name, description }, 'post_tag');
        if (add instanceof Error)
            return response.status(400).json({ error: add.message });
        return response.status(200).json(add);
    }
    async addCategory(request, response) {
        let { client_id } = request.decoded;
        let { id } = request.params;
        let { name, description } = request.body;
        let controller = new WordPress_1.Service_WordPress(client_id, id);
        let login = await controller.getToken();
        if (login instanceof Error)
            return response.status(401).json({ error: login.message });
        let add = await controller.addTaxonomies({ name, description }, 'category');
        if (add instanceof Error)
            return response.status(400).json({ error: add.message });
        return response.status(200).json(add);
    }
    async addMedia(request, response) {
        let { client_id } = request.decoded;
        let { id } = request.params;
        let controller_wp = new WordPress_1.Service_WordPress(client_id, id);
        let login = await controller_wp.getToken();
        if (login instanceof Error)
            return response.status(401).json({ error: login.message });
        let add = await controller_wp.addImage(request.body);
        if (add instanceof Error)
            return response.status(400).json({ error: add.message });
        return response.status(200).json(add);
    }
    async addPost(request, response) {
        let { client_id } = request.decoded;
        let { id } = request.params;
        let controller = new WordPress_1.Service_WordPress(client_id, id);
        let login = await controller.getToken();
        if (login instanceof Error)
            return response.status(401).json({ error: login.message });
        let execute = await controller.addPost(request.body);
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
    async statusServices(request, response) {
        let execute = await new WordPress_1.Service_WordPress(request.decoded.client_id).statusServices();
        if (execute instanceof Error)
            return response.status(400).json({ error: execute.message });
        return response.status(200).json(execute);
    }
}
exports.WordPressController = WordPressController;

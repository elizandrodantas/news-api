import { Router, Request, Response } from 'express';
import { NewsController } from './controllers/NewsController';
import { WordPressController } from './controllers/WordPressController';

import { ensuredAuthenticated } from './middleware/ensuredAuthenticated';

const app = Router();

app.use(new ensuredAuthenticated().middler);
app.get('/',  ($: Request, response: Response) => response.status(204).end());

// ***** API WORDPRESS ***** //

app.get('/wordpress', new WordPressController().status);
app.get('/wordpress/status', new WordPressController().statusServices);
app.get('/wordpress/report', new WordPressController().getJobsAndServices);
app.get('/wordpress/report/:serviceId', new WordPressController().getJobsAndServices);
app.get('/wordpress/job/:taskId', new WordPressController().jobStatus);
app.post('/wordpress/add', new WordPressController().add);
app.put('/wordpress/edit/:id', new WordPressController().edit);
app.delete('/wordpress/delete', new WordPressController().delete);
app.get('/wordpress/get/category/:service_id', new WordPressController().getCategory);
app.get('/wordpress/get/tags/:service_id' , new WordPressController().getTag);
app.post('/wordpress/add/tag/:id', new WordPressController().addTag);
app.post('/wordpress/add/category/:id', new WordPressController().addCategory);
app.post('/wordpress/add/media/:id', new WordPressController().addMedia);
app.post('/wordpress/add/post/:id', new WordPressController().addPost);

// ***** ROUTER NEWS ***** //

app.get('/news/list', new NewsController().listAll);
app.post('/news/list', new NewsController().listAll);
app.get('/news/storage/add/:id(*)', new NewsController().storageFuture);
app.get('/news/storage/:id', new NewsController().getStorage);
app.get('/news/content/:id(*)', new NewsController().getContent);
app.get('/news/category', new NewsController().getOptionsCategories);

export { app as routerSafe }
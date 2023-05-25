import { Router } from 'express';
import { upload } from '../../utils.js';
import controller from './controller.js';

const fileRouter = Router();

fileRouter.post('/upload', upload.array('files'), controller.upload);

fileRouter.get('/:fileName', controller.send);

export default fileRouter;

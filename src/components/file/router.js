import { Router } from 'express';
import { upload } from '../../utils.js';
import controller from './controller.js';

const fileRouter = Router();

fileRouter.post('/', upload.array('files'), controller.upload);

export default fileRouter;

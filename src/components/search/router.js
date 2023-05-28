import { Router } from 'express';
import controller from './controller.js';

const searchRouter = Router();

searchRouter.get('/', controller.findProducts);

export default searchRouter;

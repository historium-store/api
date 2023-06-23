import { Router } from 'express';
import controller from './controller.js';

const deliveryTypeRouter = Router();

deliveryTypeRouter.get('/', controller.getAll);

export default deliveryTypeRouter;

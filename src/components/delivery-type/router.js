import { Router } from 'express';
import { validateQueryParams } from '../../middleware.js';
import controller from './controller.js';

const deliveryTypeRouter = Router();

deliveryTypeRouter.get('/', validateQueryParams, controller.getAll);

export default deliveryTypeRouter;

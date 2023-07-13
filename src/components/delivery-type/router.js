import { Router } from 'express';
import { cache } from '../../middleware.js';
import controller from './controller.js';

const deliveryTypeRouter = Router();

deliveryTypeRouter.get('/', cache('5 minutes'), controller.getAll);

export default deliveryTypeRouter;

/**
 * @swagger
 * /delivery-type:
 *   get:
 *     summary: Get all delivery types
 *     tags:
 *       - delivery-type
 *     responses:
 *       '200':
 *         description: All delivery types
 */

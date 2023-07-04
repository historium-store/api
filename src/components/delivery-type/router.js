import { Router } from 'express';
import controller from './controller.js';

const deliveryTypeRouter = Router();

deliveryTypeRouter.get('/', controller.getAll);

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

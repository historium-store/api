import { Router } from 'express';
import { cache } from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
import controller from './controller.js';

const deliveryTypeRouter = Router();

deliveryTypeRouter.get('/', cache(CACHE_DURATION), controller.getAll);

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

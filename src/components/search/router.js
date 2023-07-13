import { Router } from 'express';
import { cache } from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
import controller from './controller.js';

const searchRouter = Router();

searchRouter.get('/', cache(CACHE_DURATION), controller.findProducts);

export default searchRouter;

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search for product(s)
 *     tags:
 *       - search
 *     responses:
 *       '200':
 *         description: Searched product(s)
 */

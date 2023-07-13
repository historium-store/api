import { Router } from 'express';
import { cache } from '../../middleware.js';
import controller from './controller.js';

const searchRouter = Router();

searchRouter.get('/', cache('5 minutes'), controller.findProducts);

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

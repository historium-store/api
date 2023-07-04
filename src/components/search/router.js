import { Router } from 'express';
import controller from './controller.js';

const searchRouter = Router();

searchRouter.get('/', controller.findProducts);

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

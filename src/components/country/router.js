import { Router } from 'express';
import { cache } from '../../middleware.js';
import controller from './controller.js';

const countryRouter = Router();

countryRouter.get('/', cache('5 minutes'), controller.getAll);

countryRouter.get('/:id', cache('5 minutes'), controller.getOne);

export default countryRouter;

/**
 * @swagger
 * /country:
 *   get:
 *     summary: Get all countries
 *     tags:
 *       - country
 *     responses:
 *       '200':
 *         description: All countries
 * /country/{id}:
 *   get:
 *     summary: Get one country
 *     tags:
 *       - country
 *     responses:
 *       '200':
 *         description: Requested country
 *       '404':
 *         description: Country not found
 */

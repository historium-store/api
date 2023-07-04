import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const bookSeriesRouter = Router();

bookSeriesRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

bookSeriesRouter
	.route('/:id')
	.get(validateId, controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		controller.deleteOne
	);

export default bookSeriesRouter;

/**
 * @swagger
 * /book-series:
 *   post:
 *     summary: Create new book series
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book-series
 *     responses:
 *       '201':
 *         description: Created book series
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all book series
 *     tags:
 *       - book-series
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All book series
 * /book-series/{id}:
 *   get:
 *     summary: Get one book series
 *     tags:
 *       - book-series
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested book series
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book series not found
 *   patch:
 *     summary: Update one existing book series
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book-series
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested book series
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book series not found
 *   delete:
 *     summary: Delete one book series
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book-series
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Book series deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book series not found
 */

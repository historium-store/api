import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const bookRouter = Router();

bookRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

bookRouter.get('/filters', controller.getFilters);

bookRouter
	.route('/:id')
	.get(controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		controller.deleteOne
	);

export default bookRouter;

/**
 * @swagger
 * /book:
 *   post:
 *     summary: Create new book
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     responses:
 *       '201':
 *         description: Created book
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all books
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All books
 * /book/{id}:
 *   get:
 *     summary: Get one book
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested book
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 *   patch:
 *     summary: Update one existing book
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested book
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 *   delete:
 *     summary: Delete one book
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Book deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book not found
 */

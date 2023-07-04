import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const productRouter = Router();

productRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

productRouter
	.route('/:id')
	.get(validateQueryParams, controller.getOne)
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

export default productRouter;

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create new product
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
 *     responses:
 *       '201':
 *         description: Created product
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all products
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All products
 * /product/{id}:
 *   get:
 *     summary: Get one product
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested product
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   patch:
 *     summary: Update one existing product
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested product
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   delete:
 *     summary: Delete one product
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Product deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 * components:
 *   responses:
 *     ProductNotFound:
 *       description: Product not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             message: Product with id '649e9445c4fda9a679b0c347' not found
 */

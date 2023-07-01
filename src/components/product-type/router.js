import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const productTypeRouter = Router();

productTypeRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validator.validateCreate,
		controller.createOne
	);

productTypeRouter
	.route('/:id')
	.get(validateId, controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin']),
		validateId,
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin']),
		validateId,
		controller.deleteOne
	);

export default productTypeRouter;

/**
 * @swagger
 * /product-type:
 *   get:
 *     summary: Get all product types
 *     tags:
 *       - product-type
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All product types
 *   post:
 *     summary: Create new product type
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product-type
 *     responses:
 *       '201':
 *         description: Created product type
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '409':
 *         description: Product type already exists
 * /product-type/{id}:
 *   get:
 *     summary: Get one product type
 *     tags:
 *       - product-type
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested product type
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Product type not found
 *   patch:
 *     summary: Update one existing product type
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product-type
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested product type
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Product type not found
 *       '409':
 *         description: Product type already exists
 *   delete:
 *     summary: Delete one product type
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product-type
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Product type deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Product type not found
 */

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

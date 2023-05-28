import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import authController from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const productTypeRouter = Router();

productTypeRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authController.authenticate,
		checkRole(['admin']),
		validator.validateCreate,
		controller.createOne
	);

productTypeRouter
	.route('/:id')
	.get(validator.validateId, controller.getOne)
	.patch(
		authController.authenticate,
		checkRole(['admin']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authController.authenticate,
		checkRole(['admin']),
		validator.validateId,
		controller.deleteOne
	);

export default productTypeRouter;

import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import authController from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const illustratorRouter = Router();

illustratorRouter
	.route('/')
	.post(
		authController.authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	)
	.get(validateQueryParams, controller.getAll);

illustratorRouter
	.route('/:id')
	.get(validator.validateId, controller.getOne)
	.patch(
		authController.authenticate,
		checkRole(['admin', 'seller']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authController.authenticate,
		checkRole(['admin', 'seller']),
		validator.validateId,
		controller.deleteOne
	);

export default illustratorRouter;

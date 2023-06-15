import { Router } from 'express';
import { validateQueryParams } from '../../middleware.js';
import authController from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const reviewRouter = Router();

reviewRouter
	.route('/')
	.post(
		authController.authenticate,
		validator.validateCreate,
		controller.createOne
	)
	.get(validateQueryParams, controller.getAll);

reviewRouter
	.route('/:id')
	.get(validator.validateId, controller.getOne)
	.patch(
		authController.authenticate,
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authController.authenticate,
		validator.validateId,
		controller.deleteOne
	);

export default reviewRouter;

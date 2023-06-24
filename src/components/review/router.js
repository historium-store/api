import { Router } from 'express';
import { validateId, validateQueryParams } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const reviewRouter = Router();

reviewRouter
	.route('/')
	.post(authenticate, validator.validateCreate, controller.createOne)
	.get(validateQueryParams, controller.getAll);

reviewRouter
	.route('/:id')
	.get(validateId, controller.getOne)
	.patch(
		authenticate,
		validateId,
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(authenticate, validateId, controller.deleteOne);

export default reviewRouter;

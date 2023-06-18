import { Router } from 'express';
import { checkRole } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const bannerRouter = Router();

bannerRouter
	.route('/')
	.get(controller.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validator.validateCreate,
		controller.createOne
	);

bannerRouter
	.route('/:id')
	.get(validator.validateId, controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin']),
		validator.validateId,
		controller.deleteOne
	);

export default bannerRouter;

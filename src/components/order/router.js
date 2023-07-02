import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const orderRouter = Router();

orderRouter
	.route('/')
	.get(
		authenticate,
		checkRole(['admin']),
		validateQueryParams,
		controller.getAll
	)
	.post(validator.validateCreate, controller.createOne);

orderRouter.get('/statuses', controller.getStatuses);

orderRouter.patch(
	'/status/:id',
	authenticate,
	checkRole(['admin', 'seller']),
	validateId,
	validator.validateUpdateStatus,
	controller.updateStatus
);

orderRouter
	.route('/:id')
	.get(authenticate, validateId, controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		validator.validateUpdate,
		controller.updateOne
	);

export default orderRouter;

import { Router } from 'express';
import {
	checkRole,
	checkSameIdOrRole,
	validateQueryParams
} from '../../middleware.js';
import authController from '../auth/controller.js';
import basketController from '../basket/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const userRouter = Router();

userRouter.get(
	'/',
	authController.authenticate,
	checkRole(['admin']),
	validateQueryParams,
	controller.getAll
);

userRouter.get('/account', authController.authenticateAndReturn);

userRouter.get(
	'/basket',
	authController.authenticate,
	basketController.getByUserId
);

userRouter.use('/:id', authController.authenticate);

userRouter
	.route('/:id')
	.get(checkRole(['admin']), validator.validateId, controller.getOne)
	.patch(
		checkSameIdOrRole(['admin']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		checkSameIdOrRole(['admin']),
		validator.validateId,
		controller.deleteOne
	);

export default userRouter;

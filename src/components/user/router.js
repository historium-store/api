import { Router } from 'express';
import { checkRole, checkSameIdOrRole } from '../../middleware.js';
import authController from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const userRouter = Router();

userRouter.get('/account', authController.authenticateAndReturn);

userRouter
	.route('/:id')
	.get(
		authController.authenticate,
		checkRole(['admin']),
		validator.validateId,
		controller.getOne
	)
	.patch(
		authController.authenticate,
		checkSameIdOrRole(['admin']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authController.authenticate,
		checkSameIdOrRole(['admin']),
		validator.validateId,
		controller.deleteOne
	);

userRouter.get(
	'/',
	authController.authenticate,
	checkRole(['admin']),
	controller.getAll
);

export default userRouter;

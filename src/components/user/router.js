import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import { authenticate as authentication } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const userRouter = Router();

userRouter.use(authentication);

userRouter.get(
	'/',
	checkRole(['admin']),
	validateQueryParams,
	controller.getAll
);

userRouter.get('/account', controller.getAccount);

userRouter
	.route('/:id')
	.get(
		checkRole(['admin']),
		validator.validateGetOne,
		controller.getOne
	)
	.patch(validator.validateUpdate, controller.updateOne)
	.delete(validator.validateId, controller.deleteOne);

export default userRouter;

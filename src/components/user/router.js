import { Router } from 'express';
import {
	checkRole,
	checkSameIdOrRole,
	validateQueryParams
} from '../../middleware.js';
import authController from '../auth/controller.js';
import basketItemController from '../basket-item/controller.js';
import basketItemValidator from '../basket-item/validator.js';
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

userRouter.use('/basket', authController.authenticate);

userRouter
	.route('/basket')
	.get(basketController.getByIdFromToken)

	.delete(basketController.clearItems);

userRouter.use('/basket-item', authController.authenticate);

userRouter
	.route('/basket-item')
	.post(
		basketItemValidator.validateItem,
		basketItemController.addItem
	)
	.delete(
		basketItemValidator.validateItem,
		basketItemController.removeItem
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

import { Router } from 'express';
import {
	checkRole,
	checkSameIdOrRole,
	validateQueryParams
} from '../../middleware.js';
import authController from '../auth/controller.js';
import cartItemController from '../cart-item/controller.js';
import cartItemValidator from '../cart-item/validator.js';
import cartController from '../cart/controller.js';
import cartValidator from '../cart/validator.js';
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

userRouter.use('/cart', authController.authenticate);

userRouter
	.route('/cart')
	.get(cartController.getByIdFromToken)
	.delete(cartController.clearItems)
	.patch(cartValidator.validateMerge, cartController.merge);

userRouter.use('/cart-item', authController.authenticate);

userRouter
	.route('/cart-item')
	.post(cartItemValidator.validateItem, cartItemController.addItem)
	.delete(
		cartItemValidator.validateItem,
		cartItemController.removeItem
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

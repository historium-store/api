import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import { authenticate as authentication } from '../auth/controller.js';
import cartItemController from '../cart-item/controller.js';
import cartItemValidator from '../cart-item/validator.js';
import cartController from '../cart/controller.js';
import cartValidator from '../cart/validator.js';
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
	.route('/cart')
	.get(cartController.getByIdFromToken)
	.patch(cartValidator.validateMerge, cartController.merge)
	.delete(cartController.clearItems);

userRouter
	.route('/cart-item')
	.all(cartItemValidator.validateItem)
	.post(cartItemController.addItem)
	.delete(cartItemController.removeItem);

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

import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import authController from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const productRouter = Router();

productRouter.route('/').get(validateQueryParams, controller.getAll);
// .post(
// 	authController.authenticate,
// 	checkRole(['admin']),
// 	validator.validateCreate,
// 	controller.createOne
// );

productRouter
	.route('/:id')
	.get(validateQueryParams, controller.getOne)
	// .patch(
	// 	authController.authenticate,
	// 	checkRole(['admin']),
	// 	validator.validateUpdate,
	// 	controller.updateOne
	// )
	.delete(
		authController.authenticate,
		checkRole(['admin']),
		controller.deleteOne
	);

export default productRouter;

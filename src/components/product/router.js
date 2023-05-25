import { Router } from 'express';
import { checkRole } from '../../middleware.js';
import authController from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const productRouter = Router();

productRouter.use(authController.authenticate, checkRole(['admin']));

productRouter
	.route('/')
	.get(controller.getAll)
	.post(validator.validateCreate, controller.createOne);

if (process.env.NODE_ENV === 'development') {
	// router.delete('/', productController.deleteAll);
}

productRouter
	.route('/:id')
	.get(validator.validateId, controller.getOne)
	.patch(validator.validateUpdate, controller.updateOne);
// .delete(validateId, productController.deleteOne);

export default productRouter;

import { Router } from 'express';
import authController from '../controllers/authController.js';
import productController from '../controllers/productController.js';
import { checkRole } from '../middleware/role-checker.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/productValidation.js';

const router = new Router();

router
	.route('/')
	.get(productController.getAll)
	.post(
		authController.authenticate,
		checkRole('admin'),
		validateCreate,
		productController.createOne
	);

router
	.route('/:id')
	.get(validateId, productController.getOne)
	.patch(
		authController.authenticate,
		checkRole('admin'),
		validateUpdate,
		productController.updateOne
	)
	.delete(
		authController.authenticate,
		checkRole('admin'),
		validateId,
		productController.deleteOne
	);

export default router;

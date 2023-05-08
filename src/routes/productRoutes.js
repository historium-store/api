import { Router } from 'express';
import { checkSchema, param } from 'express-validator';
import authController from '../controllers/authController.js';
import productController from '../controllers/productController.js';
import checkRole from '../middleware/role-checker.js';
import {
	creationSchema,
	updateSchema
} from '../schemas/productValidation.js';

const router = new Router();

router
	.route('/')
	.get(productController.getAll)
	.post(
		authController.authenticate,
		checkRole('admin'),
		checkSchema(creationSchema, ['body']),
		productController.createOne
	);

router
	.route('/:id')
	.get(
		param('id').isUUID().withMessage('Invalid product id format'),
		productController.getOne
	)
	.patch(
		authController.authenticate,
		checkRole('admin'),
		param('id').isUUID().withMessage('Invalid product id format'),
		checkSchema(updateSchema, ['body']),
		productController.updateOne
	)
	.delete(
		authController.authenticate,
		checkRole('admin'),
		param('id').isUUID().withMessage('Invalid product id format'),
		productController.deleteOne
	);

export default router;

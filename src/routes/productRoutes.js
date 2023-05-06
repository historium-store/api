import { Router } from 'express';
import { checkSchema, param } from 'express-validator';
import productController from '../controllers/productController.js';
import {
	creationSchema,
	updateSchema
} from '../schemas/productValidation.js';

const router = new Router();

router
	.route('/')
	.get(productController.getAll)
	.post(
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
		param('id').isUUID().withMessage('Invalid product id format'),
		checkSchema(updateSchema, ['body']),
		productController.updateOne
	)
	.delete(
		param('id').isUUID().withMessage('Invalid product id format'),
		productController.deleteOne
	);

export default router;

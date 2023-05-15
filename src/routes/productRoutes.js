import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import productController from '../controllers/productController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/productValidation.js';
import upload from '../utils/upload.js';

const router = new Router();

router
	.route('/')
	.get(productController.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		upload.array('images'),
		validateCreate,
		productController.createOne
	);

router
	.route('/:id')
	.get(validateId, productController.getOne)
	.patch(
		authenticate,
		checkRole(['admin']),
		validateUpdate,
		productController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin']),
		validateId,
		productController.deleteOne
	);

export default router;

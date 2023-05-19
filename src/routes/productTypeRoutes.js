import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import productTypeController from '../controllers/productTypeController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/productTypeValidation.js';

const router = new Router();

router
	.route('/')
	.get(productTypeController.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validateCreate,
		productTypeController.createOne
	);

router
	.route('/:id')
	.get(validateId, productTypeController.getOne)
	.patch(
		authenticate,
		checkRole(['admin']),
		validateUpdate,
		productTypeController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin']),
		validateId,
		productTypeController.deleteOne
	);

export default router;

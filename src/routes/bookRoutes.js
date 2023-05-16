import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import bookController from '../controllers/bookController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/bookValidation.js';

const router = new Router();

router
	.route('/')
	.get(bookController.getAll)
	.post(
		authenticate,
		checkRole(['seller', 'admin']),
		validateCreate,
		bookController.createOne
	);

router
	.route('/:id')
	.get(validateId, bookController.getOne)
	.patch(
		authenticate,
		checkRole(['seller', 'admin']),
		validateUpdate,
		bookController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['seller', 'admin']),
		validateId,
		bookController.deleteOne
	);

export default router;

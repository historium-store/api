import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import bookController from '../controllers/bookController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/bookValidation.js';

const router = Router();

router
	.route('/')
	.get(bookController.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validateCreate,
		bookController.createOne
	);

router
	.route('/:id')
	.get(validateId, bookController.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validateUpdate,
		bookController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		bookController.deleteOne
	);

export default router;

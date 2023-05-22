import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import bookSeriesController from '../controllers/bookSeriesController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/bookSeriesValidation.js';

const router = Router();

router
	.route('/')
	.get(bookSeriesController.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validateCreate,
		bookSeriesController.createOne
	);

router
	.route('/:id')
	.get(validateId, bookSeriesController.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validateUpdate,
		bookSeriesController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		bookSeriesController.deleteOne
	);

export default router;

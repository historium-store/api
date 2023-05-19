import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import authorController from '../controllers/authorController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/authorValidation.js';

const router = new Router();

router
	.route('/')
	.get(authorController.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validateCreate,
		authorController.createOne
	);

router
	.route('/:id')
	.get(validateId, authorController.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validateUpdate,
		authorController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		authorController.deleteOne
	);

export default router;

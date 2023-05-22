import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import publisherController from '../controllers/publisherController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/publisherValidation.js';

const router = Router();

router
	.route('/')
	.get(publisherController.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validateCreate,
		publisherController.createOne
	);

router
	.route('/:id')
	.get(validateId, publisherController.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validateUpdate,
		publisherController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		publisherController.deleteOne
	);

export default router;

import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import publisherController from '../controllers/publisherController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/publisherValidation.js';

const router = new Router();

router
	.route('/')
	.get(publisherController.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validateCreate,
		publisherController.createOne
	);

router
	.route('/:id')
	.get(validateId, publisherController.getOne)
	.patch(
		authenticate,
		checkRole(['admin']),
		validateUpdate,
		publisherController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin']),
		validateId,
		publisherController.deleteOne
	);

export default router;

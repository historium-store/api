import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import sectionController from '../controllers/sectionController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/sectionValidation.js';

const router = Router();

router
	.route('/')
	.get(sectionController.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validateCreate,
		sectionController.createOne
	);

router
	.route('/:id')
	.get(validateId, sectionController.getOne)
	.patch(
		authenticate,
		checkRole(['admin']),
		validateUpdate,
		sectionController.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin']),
		validateId,
		sectionController.deleteOne
	);

export default router;

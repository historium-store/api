import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateId,
	validateUpdate
} from '../schemas/userValidation.js';

const router = Router();

router
	.route('/:id')
	.get(validateId, userController.getOne)
	.patch(validateUpdate, userController.updateOne)
	.delete(validateId, userController.deleteOne);

router.get(
	'/',
	authenticate,
	checkRole(['admin']),
	userController.getAll
);

export default router;

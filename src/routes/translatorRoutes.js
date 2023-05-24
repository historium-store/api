import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import translatorController from '../controllers/translatorController.js';
import { checkRole } from '../middleware/role-checker.js';
import { validateCreate } from '../schemas/translatorValidation.js';

const router = Router();

router
	.route('/')
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validateCreate,
		translatorController.createOne
	);

export default router;

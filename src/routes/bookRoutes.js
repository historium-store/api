import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import bookController from '../controllers/bookController.js';
import { checkRole } from '../middleware/role-checker.js';
import { validateCreate } from '../schemas/bookValidation.js';

const router = new Router();

router
	.route('/')
	.post(
		authenticate,
		checkRole('seller'),
		validateCreate,
		bookController.createOne
	);

export default router;

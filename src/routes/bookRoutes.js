import { Router } from 'express';
import authController from '../controllers/authController.js';
import bookController from '../controllers/bookController.js';
import { checkRole } from '../middleware/role-checker.js';
import { validateCreate } from '../schemas/bookValidation.js';

const router = new Router();

router
	.route('/')
	.post(
		authController.authenticate,
		checkRole('seller'),
		validateCreate,
		bookController.createOne
	);

export default router;

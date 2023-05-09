import { Router } from 'express';
import { checkSchema } from 'express-validator';
import authController from '../controllers/authController.js';
import bookController from '../controllers/bookController.js';
import { checkRole } from '../middleware/role-checker.js';
import { creationSchema } from '../schemas/bookValidation.js';

const router = new Router();

router
	.route('/')
	.post(
		checkSchema(creationSchema),
		authController.authenticate,
		checkRole('seller'),
		bookController.createOne
	);

export default router;

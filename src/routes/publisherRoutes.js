import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import publisherController from '../controllers/publisherController.js';
import { checkRole } from '../middleware/index.js';
import { validateCreate } from '../schemas/publisherValidation.js';

const router = new Router();

router
	.route('/')
	.post(
		authenticate,
		checkRole(['admin']),
		validateCreate,
		publisherController.createOne
	);

export default router;

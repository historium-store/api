import { Router } from 'express';
import { checkSchema, param } from 'express-validator';
import userController from '../controllers/userController.js';
import { updateSchema } from '../schemas/validation.js';

const router = new Router();

router
	.route('/:id')
	.get(
		param('id').isUUID().withMessage('Invalid user id format'),
		userController.getOne
	)
	.patch(
		param('id').isUUID(),
		checkSchema(updateSchema, ['body']),
		userController.updateOne
	);

export default router;

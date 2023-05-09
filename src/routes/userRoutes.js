import { Router } from 'express';
import { check, param } from 'express-validator';
import userController from '../controllers/userController.js';
import {
	validateId,
	validateUpdate
} from '../schemas/userValidation.js';

const router = new Router();

router
	.route('/:id')
	.get(validateId, userController.getOne)
	.patch(validateUpdate, userController.updateOne);

export default router;

import { Router } from 'express';
import { checkRole } from '../../middleware.js';
import authController from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const translatorRouter = Router();

translatorRouter
	.route('/')
	.post(
		authController.authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

translatorRouter
	.route('/:id')
	.get(validator.validateId, controller.getOne);

export default translatorRouter;

import { Router } from 'express';
import { checkRole } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const brandRouter = Router();

brandRouter
	.route('/')
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

export default brandRouter;

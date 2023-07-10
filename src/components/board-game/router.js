import { Router } from 'express';
import { checkRole } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const boardGameRouter = Router();

boardGameRouter
	.route('/')
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

boardGameRouter.route('/:id').get(controller.getOne);

export default boardGameRouter;

import { Router } from 'express';
import { cache, checkRole } from '../../middleware.js';
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
	)
	.get(controller.getAll);

boardGameRouter
	.route('/:id')
	.get(cache('5 minutes'), controller.getOne);

export default boardGameRouter;

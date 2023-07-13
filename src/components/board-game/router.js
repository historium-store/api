import { Router } from 'express';
import { cache, checkRole } from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
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
	.get(cache(CACHE_DURATION), controller.getAll);

boardGameRouter
	.route('/:id')
	.get(cache(CACHE_DURATION), controller.getOne);

export default boardGameRouter;

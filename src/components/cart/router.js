import { Router } from 'express';
import { authenticate as authentication } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const cartRouter = Router();

cartRouter.use(authentication);

cartRouter
	.route('/')
	.get(controller.getByIdFromToken)
	.patch(validator.validateMerge, controller.merge)
	.delete(controller.clearItems);

export default cartRouter;

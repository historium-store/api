import { Router } from 'express';
import { authenticate as authentication } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const cartItemRouter = Router();

cartItemRouter.use(authentication);

cartItemRouter
	.route('/')
	.all(validator.validateItem)
	.post(controller.addItem)
	.delete(controller.removeItem);

export default cartItemRouter;

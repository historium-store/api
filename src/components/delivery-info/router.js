import { Router } from 'express';
import { checkRole } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const deliveryInfoRouter = Router();

deliveryInfoRouter.patch(
	'/:id',
	authenticate,
	checkRole(['admin', 'seller']),
	validator.validateUpdate,
	controller.updateOne
);

export default deliveryInfoRouter;

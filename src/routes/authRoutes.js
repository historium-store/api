import { Router } from 'express';
import { checkSchema } from 'express-validator';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import {
	loginSchema,
	signupSchema
} from '../schemas/userValidation.js';

const router = new Router();

router.post(
	'/signup',
	checkSchema(signupSchema, ['body']),
	userController.createOne
);

router.post(
	'/login',
	checkSchema(loginSchema, ['body']),
	authController.createToken
);

export default router;

import { Router } from 'express';
import controller from './controller.js';
import validator from './validator.js';

const authRouter = Router();

authRouter.post(
	'/signup',
	validator.validateSignup,
	controller.signup
);

authRouter.post('/login', validator.validateLogin, controller.login);

authRouter.post(
	'/password-restore',
	validator.validatePasswordRestore,
	controller.restorePassword
);

authRouter.post(
	'/verify-restore',
	validator.validateVerifyRestore,
	controller.verifyRestore
);

export default authRouter;

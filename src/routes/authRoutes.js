import { Router } from 'express';
import authController from '../controllers/authController.js';
import {
	validateLogin,
	validatePasswordRestore,
	validateSignup,
	validateVerifyRestorationToken
} from '../schemas/authValidation.js';

const router = Router();

router.post('/signup', validateSignup, authController.signup);

router.post('/login', validateLogin, authController.login);

router.post(
	'/password-restore',
	validatePasswordRestore,
	authController.restorePassword
);

router.post(
	'/verify-restoration-token',
	validateVerifyRestorationToken,
	authController.verifyRestorationToken
);

export default router;

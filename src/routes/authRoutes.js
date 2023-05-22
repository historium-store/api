import { Router } from 'express';
import authController from '../controllers/authController.js';
import {
	validateLogin,
	validateSignup
} from '../schemas/authValidation.js';

const router = Router();

router.post('/signup', validateSignup, authController.signup);

router.post('/login', validateLogin, authController.login);

export default router;

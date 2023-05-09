import { Router } from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import {
	validateLogin,
	validateSignup
} from '../schemas/userValidation.js';

const router = new Router();

router.post('/signup', validateSignup, userController.createOne);

router.post('/login', validateLogin, authController.createToken);

export default router;

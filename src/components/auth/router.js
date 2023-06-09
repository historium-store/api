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

export default authRouter;

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Create new user
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - email
 *               - password
 *             example:
 *               firstName: Ім'ян
 *               lastName: Прізвиськов
 *               phoneNumber: '0442138972'
 *               email: imyan.prizviskov@ukr.net
 *               password: 'auRwAkv5w985yQ3R'
 *     responses:
 *       '201':
 *         description: Created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '409':
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               phoneNumber:
 *                 summary: Phone number exists
 *                 value:
 *                   message: User with phone number '+380442138972' already exists
 *               email:
 *                 summary: Email exists
 *                 value:
 *                   message: User with email 'imyan.prizviskov@ukr.net' already exists
 * /login:
 *   post:
 *     summary: Login existing user
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - login
 *               - password
 *           examples:
 *             phoneNumber:
 *               summary: Using phone number
 *               value:
 *                 login: '0442138972'
 *                 password: 'auRwAkv5w985yQ3R'
 *             email:
 *               summary: Using email
 *               value:
 *                 login: imyan.prizviskov@ukr.net
 *                 password: '12345678'
 *     responses:
 *       '200':
 *         description: User authorization token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *               example:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.7-MkFgEErMq9z-Q2D8bECKtmJivPITuL_k3j3zr5P68
 *       '400':
 *         description: Provided password was incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Incorrect password
 *       '404':
 *         $ref: '#/components/responses/UserCredentialsNotFound'
 * /password-restore:
 *   post:
 *     summary: Restore user password
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *           examples:
 *               phoneNumber:
 *                 summary: Using phone number
 *                 value:
 *                   login: '0442138972'
 *               email:
 *                 summary: Using email
 *                 value:
 *                   login: imyan.prizviskov@ukr.net
 *     responses:
 *       '204':
 *         description: Temporary password sent to user email/phone number
 *       '404':
 *         $ref: '#/components/responses/UserCredentialsNotFound'
 */

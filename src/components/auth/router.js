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
 *               firstName: Віталій
 *               lastName: Смердюк
 *               phoneNumber: '+380442138972'
 *               email: vitalii.smerduk@ukr.net
 *               password: '12345678'
 *     responses:
 *       '201':
 *         description: User successfully signed up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 password:
 *                   type: string
 *                 salt:
 *                   type: string
 *                 role:
 *                   type: string
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: string
 *                 wishlist:
 *                   type: array
 *                   items:
 *                     type: string
 *                 createdAt:
 *                   type: number
 *                   format: int64
 *                 updatedAt:
 *                   type: number
 *                   format: int64
 *                 cart:
 *                   type: string
 *               example:
 *                 _id: 617268ce1a9b261b6c35cc1d
 *                 firstName: Віталій
 *                 lastName: Смердюк
 *                 phoneNumber: '+380442138972'
 *                 email: vitalii.smerduk@ukr.net
 *                 password: d74eef53e89912dc618537ae00e91347d78747e1dd7f6fcfa26732f23fcfa79c
 *                 salt: c42af8db45f10eefb83d52cfd58a0b6e
 *                 role: user
 *                 reviews: []
 *                 wishlist: []
 *                 createdAt: 1686387456078
 *                 updatedAt: 1686387456078
 *                 cart: 617c9e5d4c5ad0c2a95e9b1f
 *       '409':
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               phoneNumber:
 *                 summary: Phone number exists
 *                 value:
 *                   message: User with phone number '+380442138972' already exists
 *               email:
 *                 summary: Email exists
 *                 value:
 *                   message: User with email 'vitalii.smerduk@ukr.net' already exists
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
 *                 login: '+380442138972'
 *                 password: '12345678'
 *             email:
 *               summary: Using email
 *               value:
 *                 login: vitalii.smerduk@ukr.net
 *                 password: '12345678'
 *     responses:
 *       '200':
 *         description: User successfully logged in
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Incorrect password
 *       '404':
 *         $ref: '#/components/responses/UserNotFound'
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
 *                   login: '+380442138972'
 *               email:
 *                 summary: Using email
 *                 value:
 *                   login: vitalii.smerduk@ukr.net
 *     responses:
 *       '204':
 *         description: Temporary password sent to user email/phone number
 *       '404':
 *         $ref: '#/components/responses/UserNotFound'
 */

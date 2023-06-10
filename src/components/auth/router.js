import { Router } from 'express';
import controller from './controller.js';
import validator from './validator.js';

const authRouter = Router();

/**
 * @swagger
 * /signup:
 *   post:
 *     tags:
 *       - user
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
 *               firstName: John
 *               lastName: Williams
 *               phoneNumber: '+380442138972'
 *               email: john.williams@gmail.com
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
 *                 favorites:
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
 *                 firstName: John
 *                 lastName: Williams
 *                 phoneNumber: '+380442138972'
 *                 email: john.williams@gmail.com
 *                 password: d74eef53e89912dc618537ae00e91347d78747e1dd7f6fcfa26732f23fcfa79c
 *                 salt: c42af8db45f10eefb83d52cfd58a0b6e
 *                 role: user
 *                 reviews: []
 *                 favorites: []
 *                 createdAt: 1686387456078
 *                 updatedAt: 1686387456078
 *                 cart: 617c9e5d4c5ad0c2a95e9b1f
 *       '409':
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               phoneNumberExists:
 *                 summary: Phone number exists
 *                 value:
 *                   message: User with phone number '+380442138972' already exists
 *               emailExists:
 *                 summary: Email exists
 *                 value:
 *                   message: User with email 'john.williams@gmail.com' already exists
 */
authRouter.post(
	'/signup',
	validator.validateSignup,
	controller.signup
);

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - user
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
 *             emailExists:
 *               summary: Using email
 *               value:
 *                 login: john.williams@gmail.com
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
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.7-MkFgEErMq9z-Q2D8bECKtmJivPITuL_k3j3zr5P68
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

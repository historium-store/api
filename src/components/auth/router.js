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
 *     summary: Create user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestUser'
 *     responses:
 *       '201':
 *         description: User was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseUser'
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
 *                   message: User with phone number '+380502239457' already exists
 *               emailExists:
 *                 summary: Email exists
 *                 value:
 *                   message: User with email 'user@example.com' already exists
 */

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

/**
 * @swagger
 * components:
 *   schemas:
 *     RequestUser:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Williams
 *         phoneNumber:
 *           type: string
 *           example: '+380502239457'
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           example: '12345678'
 *
 *     ResponseUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 615e86d03e2c19825f5a2d8c
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Williams
 *         phoneNumber:
 *           type: string
 *           example: '+380502239457'
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           example: bae3c1dc3bfe45719c89229a5eb68b3ed5a0e9c35d0e4b1f92a347fc06a9d3e7
 *         salt:
 *           type: string
 *           example: 4a7e34d5ab98c0f1e2d3b6a5c7f8e910
 *         role:
 *           type: string
 *           example: user
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *           default: []
 *         favorites:
 *           type: array
 *           items:
 *             type: object
 *           default: []
 *         createdAt:
 *           type: number
 *           format: int64
 *           example: 1686214665493
 *         updatedAt:
 *           type: number
 *           format: int64
 *           example: 1686214665493
 *         basket:
 *           type: string
 *           example: 60c156b936ee3545a84c14b3
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

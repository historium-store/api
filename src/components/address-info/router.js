import { Router } from 'express';
import { checkRole, validateId } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const addressInfoRouter = Router();

addressInfoRouter.patch(
	'/:id',
	authenticate,
	checkRole(['admin', 'seller']),
	validateId,
	validator.validateUpdate,
	controller.updateOne
);

export default addressInfoRouter;

/**
 * @swagger
 * /address-info/{id}:
 *   patch:
 *     summary: Update existing address info
 *     security:
 *       - api_auth: []
 *     tags:
 *       - address-info
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               street:
 *                 type: string
 *               house:
 *                 type: string
 *               apartment:
 *                 type: string
 *               region:
 *                 type: string
 *               postcode:
 *                 type: string
 *             example:
 *               street: Вул. Перемоги
 *               house: 17/1
 *               apartment: 22
 *     responses:
 *       '200':
 *         description: Address info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 address:
 *                   type: string
 *                 street:
 *                   type: string
 *                 house:
 *                   type: string
 *                 apartment:
 *                   type: string
 *                 region:
 *                   type: string
 *                 postcode:
 *                   type: string
 *                 createdAt:
 *                   type: number
 *                 updatedAt:
 *                   type: number
 *               example:
 *                 _id: 648f20f4d6197b880bd9380c
 *                 street: Вул. Перемоги
 *                 house: 17/1
 *                 apartment: 22
 *                 postcode: 65000
 *                 createdAt: 1687101928409
 *                 updatedAt: 1687101928409
 */

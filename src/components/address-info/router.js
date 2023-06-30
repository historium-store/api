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
 *     summary: Update one existing address info
 *     security:
 *       - api_auth: []
 *     tags:
 *       - address-info
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressInfoRequest'
 *     responses:
 *       '200':
 *         description: Updated address info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddressInfoResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 * components:
 *   schemas:
 *     AddressInfoRequest:
 *       type: object
 *       properties:
 *         address:
 *           type: string
 *         street:
 *           type: string
 *         house:
 *           type: string
 *         apartment:
 *           type: string
 *         region:
 *           type: string
 *         postcode:
 *           type: string
 *       example:
 *         street: Вул. Перемоги
 *         house: 17/1
 *         apartment: 22
 *     AddressInfoResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         address:
 *           type: string
 *         street:
 *           type: string
 *         house:
 *           type: string
 *         apartment:
 *           type: string
 *         region:
 *           type: string
 *         postcode:
 *           type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       example:
 *         _id: 648f20f4d6197b880bd9380c
 *         street: Вул. Перемоги
 *         house: 17/1
 *         apartment: 22
 *         postcode: 65000
 *         createdAt: 1687101928409
 *         updatedAt: 1687101928409
 */

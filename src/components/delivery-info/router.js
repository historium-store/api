import { Router } from 'express';
import { checkRole, validateId } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const deliveryInfoRouter = Router();

deliveryInfoRouter.patch(
	'/:id',
	authenticate,
	checkRole(['admin', 'seller']),
	validateId,
	validator.validateUpdate,
	controller.updateOne
);

export default deliveryInfoRouter;

/**
 * @swagger
 * /delivery-info/{id}:
 *   patch:
 *     summary: Update one existing delivery info
 *     security:
 *       - api_auth: []
 *     tags:
 *       - delivery-info
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Updated delivery info
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 */

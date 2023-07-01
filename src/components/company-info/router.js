import { Router } from 'express';
import { checkRole, validateId } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const companyInfoRouter = Router();

companyInfoRouter.patch(
	'/:id',
	authenticate,
	checkRole(['admin', 'seller']),
	validateId,
	validator.validateUpdate,
	controller.updateOne
);

export default companyInfoRouter;

/**
 * @swagger
 * /company-info/{id}:
 *   patch:
 *     summary: Update one existing company info
 *     security:
 *       - api_auth: []
 *     tags:
 *       - company-info
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Updated company info
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 */

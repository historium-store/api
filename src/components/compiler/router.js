import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const compilerRouter = Router();

compilerRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

compilerRouter
	.route('/:id')
	.get(validateId, controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		controller.deleteOne
	);

export default compilerRouter;

/**
 * @swagger
 * /compiler:
 *   post:
 *     summary: Create new compiler
 *     security:
 *       - api_auth: []
 *     tags:
 *       - compiler
 *     responses:
 *       '201':
 *         description: Created compiler
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all compilers
 *     tags:
 *       - compiler
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All compilers
 * /compiler/{id}:
 *   get:
 *     summary: Get one compiler
 *     tags:
 *       - compiler
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested compiler
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Compiler not found
 *   patch:
 *     summary: Update one existing compiler
 *     security:
 *       - api_auth: []
 *     tags:
 *       - compiler
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested compiler
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Compiler not found
 *   delete:
 *     summary: Delete one compiler
 *     security:
 *       - api_auth: []
 *     tags:
 *       - compiler
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Compiler deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Compiler not found
 */

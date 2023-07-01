import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const publisherRouter = Router();

publisherRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

publisherRouter
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

export default publisherRouter;

/**
 * @swagger
 * /publisher:
 *   get:
 *     summary: Get all publishers
 *     tags:
 *       - publisher
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All publishers
 *   post:
 *     summary: Create new publisher
 *     security:
 *       - api_auth: []
 *     tags:
 *       - publisher
 *     responses:
 *       '201':
 *         description: Created publisher
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 * /publisher/{id}:
 *   get:
 *     summary: Get one publisher
 *     tags:
 *       - publisher
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested publisher
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Publisher not found
 *   patch:
 *     summary: Update one existing publisher
 *     security:
 *       - api_auth: []
 *     tags:
 *       - publisher
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested publisher
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Publisher not found
 *   delete:
 *     summary: Delete one publisher
 *     security:
 *       - api_auth: []
 *     tags:
 *       - publisher
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Publisher deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Publisher not found
 */

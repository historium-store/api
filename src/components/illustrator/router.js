import { Router } from 'express';
import {
	cache,
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const illustratorRouter = Router();

illustratorRouter
	.route('/')
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	)
	.get(validateQueryParams, cache('5 minutes'), controller.getAll);

illustratorRouter
	.route('/:id')
	.get(validateId, cache('5 minutes'), controller.getOne)
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

export default illustratorRouter;

/**
 * @swagger
 * /illustrator:
 *   post:
 *     summary: Create new illustrator
 *     security:
 *       - api_auth: []
 *     tags:
 *       - illustrator
 *     responses:
 *       '201':
 *         description: Created illustrator
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all illustrators
 *     tags:
 *       - illustrator
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All illustrators
 * /illustrator/{id}:
 *   get:
 *     summary: Get one illustrator
 *     tags:
 *       - illustrator
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested illustrator
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Illustrator not found
 *   patch:
 *     summary: Update one existing illustrator
 *     security:
 *       - api_auth: []
 *     tags:
 *       - illustrator
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested illustrator
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Illustrator not found
 *   delete:
 *     summary: Delete one illustrator
 *     security:
 *       - api_auth: []
 *     tags:
 *       - illustrator
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Illustrator deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Illustrator not found
 */

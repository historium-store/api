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

const translatorRouter = Router();

translatorRouter
	.route('/')
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	)
	.get(validateQueryParams, cache('5 minutes'), controller.getAll);

translatorRouter
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

export default translatorRouter;

/**
 * @swagger
 * /translator:
 *   post:
 *     summary: Create new translator
 *     security:
 *       - api_auth: []
 *     tags:
 *       - translator
 *     responses:
 *       '201':
 *         description: Created translator
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all translators
 *     tags:
 *       - translator
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All translators
 * /translator/{id}:
 *   get:
 *     summary: Get one translator
 *     tags:
 *       - translator
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested translator
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Translator not found
 *   patch:
 *     summary: Update one existing translator
 *     security:
 *       - api_auth: []
 *     tags:
 *       - translator
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested translator
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Translator not found
 *   delete:
 *     summary: Delete one translator
 *     security:
 *       - api_auth: []
 *     tags:
 *       - translator
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Translator deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Translator not found
 */

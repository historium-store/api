import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const editorRouter = Router();

editorRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

editorRouter
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

export default editorRouter;

/**
 * @swagger
 * /editor:
 *   get:
 *     summary: Get all editors
 *     tags:
 *       - editor
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All editors
 *   post:
 *     summary: Create new editor
 *     security:
 *       - api_auth: []
 *     tags:
 *       - editor
 *     responses:
 *       '201':
 *         description: Created editor
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 * /editor/{id}:
 *   get:
 *     summary: Get one editor
 *     tags:
 *       - editor
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested editor
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Editor not found
 *   patch:
 *     summary: Update one existing editor
 *     security:
 *       - api_auth: []
 *     tags:
 *       - editor
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested editor
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Editor not found
 *   delete:
 *     summary: Delete one editor
 *     security:
 *       - api_auth: []
 *     tags:
 *       - editor
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Editor deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Editor not found
 */

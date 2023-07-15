import { Router } from 'express';
import {
	cache,
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const editorRouter = Router();

editorRouter
	.route('/')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

editorRouter
	.route('/:id')
	.get(validateId, cache(CACHE_DURATION), controller.getOne)
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
 *   post:
 *     summary: Create new editor
 *     security:
 *       - api_auth: []
 *     tags:
 *       - editor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *             example:
 *               fullName: Роман Клочко
 *     responses:
 *       '201':
 *         description: Created editor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EditorResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EditorResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EditorResponse'
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               books:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               books:
 *                 - 6473b733569debe2438c78c0
 *                 - 6473c260569debe2438c7906
 *     responses:
 *       '200':
 *         description: Updated editor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EditorResponse'
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
 * components:
 *   schemas:
 *     EditorResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         fullName:
 *           type: string
 *         books:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       example:
 *         _id: 6473ab64c9dd40d6f991c5bc
 *         fullName: Вікторія Стах
 *         books:
 *           - 6473b317569debe2438c7856
 *           - 64b05745d2e35f26029e067d
 *         createdAt: 1685302116345
 *         updatedAt: 1689278277035
 */

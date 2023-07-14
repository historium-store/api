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

const publisherRouter = Router();

publisherRouter
	.route('/')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

publisherRouter
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

export default publisherRouter;

/**
 * @swagger
 * /publisher:
 *   post:
 *     summary: Create new publisher
 *     security:
 *       - api_auth: []
 *     tags:
 *       - publisher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 minLength: 40
 *                 maxLength: 1000
 *               logo:
 *                 type: string
 *             required:
 *               - name
 *             example:
 *               name: Лебідь, Рак та Щука
 *     responses:
 *       '201':
 *         description: Created publisher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublisherResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PublisherResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublisherResponse'
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bookSeries:
 *                 type: array
 *                 items:
 *                   type: string
 *               books:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *                 minLength: 40
 *                 maxLength: 1000
 *               logo:
 *                 type: string
 *             example:
 *               books:
 *                 - 6474dd030472d62ed62f451c
 *                 - 64775363b29e227224deb79c
 *                 - 6473b1aa394b41f5828a5e3d
 *     responses:
 *       '200':
 *         description: Updated publisher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublisherResponse'
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
 * components:
 *   schemas:
 *     PublisherResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         bookSeries:
 *           type: array
 *           items:
 *             type: string
 *         books:
 *           type: array
 *           items:
 *             type: string
 *         description:
 *           type: string
 *         logo:
 *           type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       example:
 *         _id: 64734714f82f3873394f3d7e
 *         name: Рідна Мова
 *         bookSeries:
 *           - 64745ff3fd6b8e660ca42dee
 *         books:
 *           - 6474dd030472d62ed62f451c
 *         createdAt: 1685276436284
 *         updatedAt: 1685380355492
 */

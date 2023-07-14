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

const bookSeriesRouter = Router();

bookSeriesRouter
	.route('/')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

bookSeriesRouter
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

export default bookSeriesRouter;

/**
 * @swagger
 * /book-series:
 *   post:
 *     summary: Create new book series
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book-series
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               publisher:
 *                 type: string
 *               books:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               name: Українська Поетична Антологія
 *               publisher: 64734ad09d7e69643faf5ef1
 *               books:
 *                 - 6473b4da569debe2438c787a
 *     responses:
 *       '201':
 *         description: Created book series
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookSeriesResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all book series
 *     tags:
 *       - book-series
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All book series
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookSeriesResponse'
 * /book-series/{id}:
 *   get:
 *     summary: Get one book series
 *     tags:
 *       - book-series
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested book series
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookSeriesResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book series not found
 *   patch:
 *     summary: Update one existing book series
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book-series
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
 *               publisher:
 *                 type: string
 *               books:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               name: Навчальна література
 *     responses:
 *       '200':
 *         description: Updated book series
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookSeriesResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book series not found
 *   delete:
 *     summary: Delete one book series
 *     security:
 *       - api_auth: []
 *     tags:
 *       - book-series
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Book series deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Book series not found
 * components:
 *   schemas:
 *     BookSeriesResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         publisher:
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
 *         _id: 6473a950c9dd40d6f991c557
 *         name: Українська Поетична Антологія
 *         publisher: 64734ad09d7e69643faf5ef1
 *         books:
 *           - 6473b4da569debe2438c787a
 *         createdAt: 1685301584043
 *         updatedAt: 1685304538177
 */

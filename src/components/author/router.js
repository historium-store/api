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

const authorRouter = Router();

authorRouter
	.route('/')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

authorRouter
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

export default authorRouter;

/**
 * @swagger
 * /author:
 *   post:
 *     summary: Create new author
 *     security:
 *       - api_auth: []
 *     tags:
 *       - author
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               biography:
 *                 type: string
 *                 minLength: 40
 *                 maxLength: 1000
 *               pictures:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 3
 *             required:
 *               - fullName
 *             example:
 *               fullName: Ім'ян Прізвиськов
 *               biography: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ac auctor augue mauris augue neque gravida in fermentum et. Vitae suscipit tellus mauris a. Massa id neque aliquam vestibulum morbi. Tincidunt praesent semper feugiat nibh. Eu sem integer vitae justo eget magna fermentum iaculis. Id consectetur purus ut faucibus pulvinar elementum integer enim neque. Vestibulum morbi blandit cursus risus at ultrices mi. Ut etiam sit amet nisl purus in. Et leo duis ut diam quam nulla. Eu consequat ac felis donec et. Pharetra magna ac placerat vestibulum lectus. Adipiscing diam donec adipiscing tristique risus nec feugiat. Egestas maecenas pharetra convallis posuere morbi. Cursus sit amet dictum sit amet justo donec.
 *               pictures:
 *                 - url-to-picture
 *                 - url-to-another-picture
 *     responses:
 *       '201':
 *         description: Created author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '409':
 *         $ref: '#/components/responses/AuthorAlreadyExists'
 *   get:
 *     summary: Get all authors
 *     tags:
 *       - author
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuthorResponse'
 * /author/{id}:
 *   get:
 *     summary: Get one author
 *     tags:
 *       - author
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorResponse'
 *       '404':
 *         $ref: '#/components/responses/AuthorNotFound'
 *   patch:
 *     summary: Update one existing author
 *     security:
 *       - api_auth: []
 *     tags:
 *       - author
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
 *               biography:
 *                 type: string
 *                 minLength: 40
 *                 maxLength: 1000
 *               pictures:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 3
 *             example:
 *               pictures:
 *                 - url-to-new-picture
 *                 - url-to-another-new-picture
 *     responses:
 *       '200':
 *         description: Updated author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/AuthorNotFound'
 *       '409':
 *         $ref: '#/components/responses/AuthorAlreadyExists'
 *   delete:
 *     summary: Delete one author
 *     security:
 *       - api_auth: []
 *     tags:
 *       - author
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Author deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/AuthorNotFound'
 * components:
 *   schemas:
 *     AuthorResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         fullName:
 *           type: string
 *         biography:
 *           type: string
 *           minLength: 40
 *           maxLength: 1000
 *         pictures:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           maxItems: 3
 *         books:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       example:
 *         _id: 649d5f0b3db3b3532c32b3cf
 *         fullName: Ім'ян Прізвиськов
 *         biography: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ac auctor augue mauris augue neque gravida in fermentum et. Vitae suscipit tellus mauris a. Massa id neque aliquam vestibulum morbi. Tincidunt praesent semper feugiat nibh. Eu sem integer vitae justo eget magna fermentum iaculis. Id consectetur purus ut faucibus pulvinar elementum integer enim neque. Vestibulum morbi blandit cursus risus at ultrices mi. Ut etiam sit amet nisl purus in. Et leo duis ut diam quam nulla. Eu consequat ac felis donec et. Pharetra magna ac placerat vestibulum lectus. Adipiscing diam donec adipiscing tristique risus nec feugiat. Egestas maecenas pharetra convallis posuere morbi. Cursus sit amet dictum sit amet justo donec.
 *         pictures:
 *           - url-to-picture
 *           - url-to-another-picture
 *         books: []
 *         createdAt: 1687101928409
 *         updatedAt: 1687101928409
 *   responses:
 *     AuthorAlreadyExists:
 *       description: Author already exists
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             message: Author with full name 'Ім'ян Прізвиськов' already exists
 *     AuthorNotFound:
 *       description: Author not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             message: Author with id '649d5f0b3db3b3532c32b3cf' not found
 */

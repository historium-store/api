import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const authorRouter = Router();

authorRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

authorRouter
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
 *               fullName: Віктор Браун
 *               biography: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ac auctor augue mauris augue neque gravida in fermentum et. Vitae suscipit tellus mauris a. Massa id neque aliquam vestibulum morbi. Tincidunt praesent semper feugiat nibh. Eu sem integer vitae justo eget magna fermentum iaculis. Id consectetur purus ut faucibus pulvinar elementum integer enim neque. Vestibulum morbi blandit cursus risus at ultrices mi. Ut etiam sit amet nisl purus in. Et leo duis ut diam quam nulla. Eu consequat ac felis donec et. Pharetra magna ac placerat vestibulum lectus. Adipiscing diam donec adipiscing tristique risus nec feugiat. Egestas maecenas pharetra convallis posuere morbi. Cursus sit amet dictum sit amet justo donec.
 *               pictures:
 *                 - url-to-picture
 *                 - url-to-another-picture
 *     responses:
 *       '201':
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 biography:
 *                   type: string
 *                   minLength: 40
 *                   maxLength: 1000
 *                 pictures:
 *                   type: array
 *                   items:
 *                     type: string
 *                   minItems: 1
 *                   maxItems: 3
 *                 books:
 *                   type: array
 *                   items:
 *                     type: string
 *                 createdAt:
 *                   type: number
 *                 updatedAt:
 *                   type: number
 *               example:
 *                 _id: 649d5f0b3db3b3532c32b3cf
 *                 fullName: Віктор Браун
 *                 biography: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ac auctor augue mauris augue neque gravida in fermentum et. Vitae suscipit tellus mauris a. Massa id neque aliquam vestibulum morbi. Tincidunt praesent semper feugiat nibh. Eu sem integer vitae justo eget magna fermentum iaculis. Id consectetur purus ut faucibus pulvinar elementum integer enim neque. Vestibulum morbi blandit cursus risus at ultrices mi. Ut etiam sit amet nisl purus in. Et leo duis ut diam quam nulla. Eu consequat ac felis donec et. Pharetra magna ac placerat vestibulum lectus. Adipiscing diam donec adipiscing tristique risus nec feugiat. Egestas maecenas pharetra convallis posuere morbi. Cursus sit amet dictum sit amet justo donec.
 *                 pictures:
 *                   - url-to-picture
 *                   - url-to-another-picture
 *                 books: []
 *                 createdAt: 1687101928409
 *                 updatedAt: 1687101928409
 *       '409':
 *         description: Author already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: Author with full name 'Віктор Браун' already exists
 */

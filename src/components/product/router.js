import { Router } from 'express';
import {
	cache,
	checkRole,
	validateQueryParams
} from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const productRouter = Router();

productRouter
	.route('/')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getAll)
	.post(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateCreate,
		controller.createOne
	);

productRouter
	.route('/:id')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin', 'seller']),
		controller.deleteOne
	);

export default productRouter;

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create new product
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
 *     responses:
 *       '201':
 *         description: Created product
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all products
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All products
 * /product/{id}:
 *   get:
 *     summary: Get one product
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested product
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   patch:
 *     summary: Update one existing product
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested product
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   delete:
 *     summary: Delete one product
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Product deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 * components:
 *   schemas:
 *     ProductResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         creators:
 *           type: array
 *           items:
 *             type: string
 *         type:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             key:
 *               type: string
 *         key:
 *           type: string
 *         price:
 *           type: integer
 *         quantity:
 *           type: integer
 *         createdAt:
 *           type: integer
 *         code:
 *           type: string
 *         image:
 *           type: string
 *         requiresDelivery:
 *           type: boolean
 *       example:
 *         _id: 6473b1aa394b41f5828a5e34
 *         name: Людина в пошуках справжнього сенсу. Психолог у концтаборі
 *         creators:
 *           - Віктор Франкл
 *         key: lyudina-v-poshukah-spravzhnogo-sensu-psiholog-u-konctabori
 *         price: 130
 *         quantity: 10000
 *         type:
 *           name: Книга
 *           key: book
 *         createdAt: 1685303722631
 *         code: '116010'
 *         image: https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/2c1475ac-6a0d-43da-8b31-c522d7ccaff4.jpg
 *         requiresDelivery: true
 *   responses:
 *     ProductNotFound:
 *       description: Product not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             message: Product with id '649e9445c4fda9a679b0c347' not found
 */

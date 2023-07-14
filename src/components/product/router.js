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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               creators:
 *                 type: array
 *                 items:
 *                   type: string
 *               key:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *                 minLength: 50
 *                 maxLength: 10000
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiresDelivery:
 *                 type: boolean
 *             required:
 *               - name
 *               - type
 *               - price
 *               - description
 *               - images
 *               - sections
 *             example:
 *               name: Я бачу, Вас цікавить пітьма
 *               creators:
 *                 - Ілларіон Павлюк
 *               type: 64737ffb4adab164082714ba
 *               price: 200
 *               description: Київського кримінального психолога Андрія Гайстера відправляють консультантом у богом забуте селище Буськів Сад. Зимової ночі там зникла маленька дівчинка. А ще там водиться Звір — серійний маніяк, убивств якого тамтешні мешканці воліють не помічати... У цьому проклятому селищі, де все по колу і всі живуть життям, яке ненавидять, розслідування постійно заходить у глухий кут. Андрій вірить, що загублена дівчинка, попри все, жива і він її знайде. Але нікому, крім нього, це не потрібно. «Я бачу, вас цікавить пітьма» — історія про непробивну людську байдужість і пітьму всередині нас. Про чесність із собою й ціну, яку ми готові заплатити за забуття. Про гріхи, що матеріалізуються, і спокуту, дорожчу за спокій.
 *               images:
 *                 - https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/9a155b82-3134-489f-aac4-2ab11e460f1c.webp
 *               sections:
 *                 - 6473a52ec9dd40d6f991c4e9
 *               requiresDelivery: false
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 * /product/{id}:
 *   get:
 *     summary: Get one product by id
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   patch:
 *     summary: Update one existing product by id
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
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
 *               creators:
 *                 type: array
 *                 items:
 *                   type: string
 *               key:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *                 minLength: 50
 *                 maxLength: 10000
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiresDelivery:
 *                 type: boolean
 *             example:
 *               quantity: 1000
 *     responses:
 *       '200':
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   delete:
 *     summary: Delete one product by id
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
 * /product/{key}:
 *   get:
 *     summary: Get one product by key
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/key'
 *     responses:
 *       '200':
 *         description: Requested product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   patch:
 *     summary: Update one existing product by key
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/key'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               creators:
 *                 type: array
 *                 items:
 *                   type: string
 *               key:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *                 minLength: 50
 *                 maxLength: 10000
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiresDelivery:
 *                 type: boolean
 *             example:
 *               quantity: 1000
 *     responses:
 *       '200':
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   delete:
 *     summary: Delete one product by key
 *     security:
 *       - api_auth: []
 *     tags:
 *       - product
 *     parameters:
 *       - $ref: '#/components/parameters/key'
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
 *     ProductEntry:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *       required:
 *         - product
 *       example:
 *         product: 649d2022af43bbb201d8e129
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

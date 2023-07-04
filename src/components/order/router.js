import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const orderRouter = Router();

orderRouter
	.route('/')
	.get(
		authenticate,
		checkRole(['admin']),
		validateQueryParams,
		controller.getAll
	)
	.post(validator.validateCreate, controller.createOne);

orderRouter.get('/statuses', controller.getStatuses);

orderRouter.patch(
	'/status/:id',
	authenticate,
	checkRole(['admin', 'seller']),
	validateId,
	validator.validateUpdateStatus,
	controller.updateStatus
);

orderRouter
	.route('/:id')
	.get(authenticate, validateId, controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin', 'seller']),
		validateId,
		validator.validateUpdate,
		controller.updateOne
	);

export default orderRouter;

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Create new order
 *     tags:
 *       - order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   email:
 *                     type: string
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - phoneNumber
 *                   - email
 *               receiverInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                 required:
 *                   - firstName
 *                   - lastName
 *                   - phoneNumber
 *               companyInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   identificationNumber:
 *                     type: string
 *                   address:
 *                     type: string
 *                 required:
 *                   - name
 *                   - identificationNumber
 *                   - address
 *               deliveryInfo:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   city:
 *                     type: string
 *                   type:
 *                     type: string
 *                   address:
 *                     type: string
 *                   street:
 *                     type: string
 *                   house:
 *                     type: string
 *                   apartment:
 *                     type: string
 *                 required:
 *                   - country
 *                   - city
 *                   - type
 *               gift:
 *                 type: boolean
 *               callback:
 *                 type: boolean
 *               paymentType:
 *                 type: string
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *               items:
 *                 description: If authorization token is provided - items will be taken from user's cart. No need to send it
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *             required:
 *               - contactInfo
 *               - paymentType
 *             example:
 *               contactInfo:
 *                 firstName: Ім'ян
 *                 lastName: Прізвиськов
 *                 phoneNumber: '+380442138972'
 *                 email: imyan.prizviskov@ukr.net
 *               receiverInfo:
 *                 firstName: Прізва
 *                 lastName: Ім'янова
 *                 phoneNumber: '+380445139822'
 *               companyInfo:
 *                 name: Компакт
 *                 identificationNumber: '18452271'
 *                 address: вул. Поточна, 23/1
 *               callback: true
 *               deliveryInfo:
 *                 country: Україна
 *                 city: Полтава
 *                 type: Відділення Нова Пошта
 *                 address: просп. Довідкова, 12
 *               paymentType: 'Готівкою або карткою: При отриманні'
 *               items:
 *                 - product: 6473c4ef569debe2438c794f
 *                 - product: 6474dd020472d62ed62f4513
 *                   quantity: 3
 *     responses:
 *       '201':
 *         description: Created order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       '400':
 *         description: User exists or no items provided
 *       '404':
 *         $ref: '#/components/responses/ProductNotFound'
 *   get:
 *     summary: Get all orders
 *     security:
 *       - api_auth: []
 *     tags:
 *       - order
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All orders
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 * /order/statuses:
 *   get:
 *     summary: Get all order statuses
 *     tags:
 *       - order
 *     responses:
 *       '200':
 *         description: All order statuses
 * /order/{id}:
 *   get:
 *     summary: Get one order
 *     security:
 *       - api_auth: []
 *     tags:
 *       - order
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Order not found
 *   patch:
 *     summary: Update one existing order
 *     security:
 *       - api_auth: []
 *     tags:
 *       - order
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Updated order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Order not found
 * /order/status/{id}:
 *   patch:
 *     summary: Update status of one existing order
 *     security:
 *       - api_auth: []
 *     tags:
 *       - order
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *             example:
 *               status: Виконаний
 *     responses:
 *       '200':
 *         description: Updated order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Order not found
 * components:
 *   schemas:
 *     OrderResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         contactInfo:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             email:
 *               type: string
 *         receiverInfo:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             phoneNumber:
 *               type: string
 *         companyInfo:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             identificationNumber:
 *               type: string
 *             address:
 *               type: string
 *         deliveryInfo:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *             city:
 *               type: string
 *             type:
 *               type: string
 *             address:
 *               type: string
 *             street:
 *               type: string
 *             house:
 *               type: string
 *             apartment:
 *               type: string
 *         gift:
 *           type: boolean
 *         callback:
 *           type: boolean
 *         paymentType:
 *           type: string
 *         comment:
 *           type: string
 *           maxLength: 500
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: integer
 *                   code:
 *                     type: string
 *                   image:
 *                     type: string
 *               quantity:
 *                 type: integer
 *         status:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             key:
 *               type: string
 *         totalPrice:
 *           type: integer
 *         totalQuantity:
 *           type: integer
 *         number:
 *           type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       example:
 *         contactInfo:
 *           firstName: Ім'ян
 *           lastName: Прізвиськов
 *           phoneNumber: "+380442138972"
 *           email: imyan.prizviskov@ukr.net
 *         receiverInfo:
 *           firstName: Прізва
 *           lastName: Ім'янова
 *           phoneNumber: "+380445139822"
 *         gift: false
 *         companyInfo:
 *           name: Компакт
 *           identificationNumber: '18452271'
 *           address: вул. Поточна, 23/1
 *         callback: true
 *         deliveryInfo:
 *           country: Україна
 *           city: Полтава
 *           type: Відділення Нова Пошта
 *           address: просп. Довідкова, 12
 *         paymentType: 'Готівкою або карткою: При отриманні'
 *         status:
 *           name: Поточний
 *           key: active
 *         user:
 *           firstName: Ім'ян
 *           lastName: Прізвиськов
 *           phoneNumber: "+380442138972"
 *           email: imyan.prizviskov@ukr.net
 *           password: 8b89f0f7e1ba551a3875cd39f318e64994b0b8735aa7a3228ac1e39d401867d3
 *           salt: f556aedd3805753a17df728e1e30f200
 *           role: user
 *           reviews: []
 *           wishlist: []
 *           products: []
 *           _id: 64a16b673415f20927d3dc67
 *           createdAt: 1688300391024
 *           updatedAt: 1688300391027
 *           cart:
 *             items: []
 *             user: 64a16b673415f20927d3dc67
 *             _id: 64a16b673415f20927d3dc69
 *             createdAt: 1688300391025
 *             updatedAt: 1688300391025
 *         items:
 *         - product:
 *             type: Книга
 *             name: Мистецтво говорити. Таємниці ефективного спілкування
 *             price: 320
 *             code: '115975'
 *             image: https://historium-bucket-eu.s3.eu-central-1.amazonaws.com/       3de802f9-836c-42ac-b6d9-a3aeae97f82d.webp
 *           quantity: 1
 *           _id: 64a16b673415f20927d3dc6e
 *         - product:
 *             type: Книга
 *             name: Бетмен. Книга 1. Суд сов
 *             price: 468
 *             code: '115979'
 *             image: https://historium-bucket-eu.s3.eu-central-1.amazonaws.com/       b50bb425-4fc3-4ab3-ada2-9c95b377f081.webp
 *           quantity: 3
 *           _id: 64a16b673415f20927d3dc6f
 *         totalPrice: 1784
 *         totalQuantity: 4
 *         _id: 64a16b673415f20927d3dc6d
 *         createdAt: 1688300391031
 *         updatedAt: 1688300391031
 *         number: '2000134373'
 */

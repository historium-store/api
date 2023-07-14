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

const orderRouter = Router();

orderRouter
	.route('/')
	.post(validator.validateCreate, controller.createOne)
	.get(
		authenticate,
		checkRole(['admin']),
		validateQueryParams,
		cache(CACHE_DURATION),
		controller.getAll
	);

orderRouter.get(
	'/statuses',
	cache(CACHE_DURATION),
	controller.getStatuses
);

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
	.get(
		authenticate,
		validateId,
		cache(CACHE_DURATION),
		controller.getOne
	)
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
 *                 description: If authorization token is provided - items will be taken from  user's cart. No need to send it
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   key:
 *                     type: string
 *                 example:
 *                   _id: 64b13d1b614469bf255d1892
 *                   name: Скасований
 *                   key: canceled
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
 *     requestBody:
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
 *               receiverInfo:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *               companyInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   identificationNumber:
 *                     type: string
 *                   address:
 *                     type: string
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
 *                 description: If authorization token is provided - items will be taken from  user's cart. No need to send it
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *             example:
 *               deliveryInfo:
 *                 address: "вул. Свободи, 23"
 *               paymentType: Оплата карткою On-line
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
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 $ref: '#/components/schemas/ProductResponse'
 *               quantity:
 *                 type: integer
 *         user:
 *           type: string
 *         comment:
 *           type: string
 *           maxLength: 500
 *         totalPrice:
 *           type: integer
 *         totalQuantity:
 *           type: integer
 *         deliveryPrice:
 *           type: integer
 *         status:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             key:
 *               type: string
 *         number:
 *           type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       required:
 *         - _id
 *         - contactInfo
 *         - gift
 *         - callback
 *         - paymentType
 *         - items
 *         - user
 *         - totalPrice
 *         - totalQuantity
 *         - deliveryPrice
 *         - status
 *         - number
 *         - createdAt
 *         - updatedAt
 *       example:
 *         _id: 64a5b36c488aec4d50a691c4
 *         contactInfo:
 *           firstName: Ім'ян
 *           lastName: Прізвиськов
 *           phoneNumber: "+380442138972"
 *           email: imyan.prizviskov@ukr.net
 *         receiverInfo:
 *           firstName: Прізва
 *           lastName: Ім'янова
 *           phoneNumber: "+380445139822"
 *         companyInfo:
 *           name: Компакт
 *           identificationNumber: '18452271'
 *           address: вул. Поточна, 23/1
 *         deliveryInfo:
 *           country: Україна
 *           city: Полтава
 *           type: Відділення Нова Пошта
 *           address: просп. Довідкова, 12
 *         gift: false
 *         callback: true
 *         paymentType: 'Готівкою або карткою: При отриманні'
 *         items:
 *         - product:
 *             _id: 6473c4ef569debe2438c794f
 *             name: Мистецтво говорити. Таємниці ефективного спілкування
 *             creators:
 *               - Джеймс Борг
 *             key: mistectvo-govoriti-taiemnici-efektivnogo-spilkuvannya
 *             price: 320
 *             quantity: 500
 *             type:
 *               name: Книга
 *               key: book
 *             createdAt: 1689079469671
 *             code: '116018'
 *             image: https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/206ec0fb-7f22-43c5-b7a6-c361f7b416ef.webp
 *             requiresDelivery: true
 *           quantity: 1
 *         - product:
 *             _id: 6474dd020472d62ed62f4513
 *             name: Бетмен. Книга 1. Суд сов
 *             creators:
 *               - Скотт Снайдер
 *             key: betmen-kniga-1-sud-sov
 *             price: 468
 *             quantity: 0
 *             type:
 *               name: Книга
 *               key: book
 *             createdAt: 1689079469671
 *             code: '116022'
 *             image: https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/cbdd4b36-50e5-47c6-b516-a3632476ee7e.webp
 *             requiresDelivery: true
 *           quantity: 3
 *         user: 64a5b36c488aec4d50a691be
 *         totalPrice: 1784
 *         totalQuantity: 4
 *         deliveryPrice: 60
 *         status:
 *           name: Поточний
 *           key: active
 *         number: '2000134351'
 *         createdAt: 1688580972442
 *         updatedAt: 1688580972442
 */

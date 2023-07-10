import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import {
	authenticate,
	authenticate as authentication
} from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const userRouter = Router();

userRouter.use(authentication);

userRouter.get(
	'/',
	checkRole(['admin']),
	validateQueryParams,
	controller.getAll
);

userRouter.get('/account', controller.getAccount);

userRouter
	.route('/wishlist')
	.all(validator.validateProductEntry)
	.post(controller.addToWishlist)
	.delete(controller.removeFromWishlist);

userRouter
	.route('/history')
	.get(controller.getHistory)
	.post(validator.validateProductEntry, controller.addToHistory)
	.patch(validator.validateMergeHistory, controller.mergeHistory);

userRouter
	.route('/orders')
	.get(validateQueryParams, controller.getOrders);

userRouter
	.route('/:id')
	.get(checkRole(['admin']), validateId, controller.getOne)
	.patch(validateId, validator.validateUpdate, controller.updateOne)
	.delete(validateId, controller.deleteOne);

export default userRouter;

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 * /user/{id}:
 *   get:
 *     summary: Get one user
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/UserNotFound'
 *   patch:
 *     summary: Update one existing user
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             example:
 *               email: imyan.prizviskov@gmail.com
 *               password: '87654321'
 *     responses:
 *       '200':
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/UserNotFound'
 *   delete:
 *     summary: Delete one user
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: User deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/UserNotFound'
 * /user/account:
 *   get:
 *     summary: Get user account
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     responses:
 *       '200':
 *         description: User data associated with account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 * /user/wishlist:
 *   post:
 *     summary: Add product to user's wishlist
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductEntry'
 *     responses:
 *       '204':
 *         description: Product added to user's wishlist successfully
 *       '404':
 *         description: User or product not found
 *   delete:
 *     summary: Remove product from user's wishlist
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductEntry'
 *     responses:
 *       '204':
 *         description: Product removed from user's wishlist successfully
 *       '404':
 *         description: User or product not found
 * /user/orders:
 *   get:
 *     summary: Get all orders made by user
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     responses:
 *       '200':
 *         description: All orders made by user
 *         content:
 *           application/json:
 *             example:
 *               - contactInfo:
 *                   firstName: Ім'ян
 *                   lastName: Прізвиськов
 *                   phoneNumber: "+380442138972"
 *                   email: bimlicupsu@gufum.com
 *                 receiverInfo:
 *                   firstName: Прізва
 *                   lastName: Ім'янова
 *                   phoneNumber: "+380445139822"
 *                 companyInfo:
 *                   name: Компакт
 *                   identificationNumber: '18452271'
 *                   address: вул. Поточна, 23/1
 *                 deliveryInfo:
 *                   country: Україна
 *                   city: Полтава
 *                   type: Відділення Нова Пошта
 *                   address: просп. Довідкова, 12
 *                 status:
 *                   name: Поточний
 *                   key: active
 *                 _id: 64a5b36c488aec4d50a691c4
 *                 gift: false
 *                 callback: true
 *                 paymentType: 'Готівкою або карткою: При отриманні'
 *                 user: 64a5b36c488aec4d50a691be
 *                 items:
 *                 - product:
 *                     type: Книга
 *                     name: Мистецтво говорити. Таємниці ефективного спілкування
 *                     price: 320
 *                     code: '115994'
 *                     image: https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/206ec0fb-7f22-43c5-b7a6-c361f7b416ef.webp
 *                   quantity: 1
 *                   _id: 64a5b36c488aec4d50a691c5
 *                 - product:
 *                     type: Книга
 *                     name: Бетмен. Книга 1. Суд сов
 *                     price: 468
 *                     code: '116000'
 *                     image: https://historium-store-s3-eu.s3.eu-central-1.amazonaws.com/cbdd4b36-50e5-47c6-b516-a3632476ee7e.webp
 *                   quantity: 3
 *                   _id: 64a5b36c488aec4d50a691c6
 *                 totalPrice: 1784
 *                 totalQuantity: 4
 *                 createdAt: 1688580972442
 *                 updatedAt: 1688580972442
 *                 number: '2000134351'
 * /user/history:
 *   post:
 *     summary: Add product to user's viewed products history
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductEntry'
 *     responses:
 *       '204':
 *         description: Product added to user's history successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: User or product not found
 *   get:
 *     summary: Get products in user's history
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     responses:
 *       '200':
 *         description: All products in user's history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: User or product not found
 *   patch:
 *     summary: Merge local user history and saved
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *             example:
 *               - 6473b4d9569debe2438c7871
 *     responses:
 *       '200':
 *         description: Updated user history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: User or product not found
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         reviews:
 *           type: array
 *           items:
 *             type: string
 *         wishlist:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *         cart:
 *           type: string
 *       example:
 *         _id: 617268ce1a9b261b6c35cc1d
 *         firstName: Ім'ян
 *         lastName: Прізвиськов
 *         phoneNumber: '+380442138972'
 *         email: imyan.prizviskov@ukr.net
 *         role: user
 *         reviews: []
 *         wishlist: []
 *         createdAt: 1686387456078
 *         updatedAt: 1686387456078
 *         cart: 617c9e5d4c5ad0c2a95e9b1f
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
 *     UserCredentialsNotFound:
 *       description: User credentials not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           examples:
 *             phoneNumber:
 *               summary: Phone number not found
 *               value:
 *                 message: User with phone number '+380442138972' not found
 *             email:
 *               summary: Email not found
 *               value:
 *                 message: User with email 'imyan.prizviskov@ukr.net' not found
 *     UserNotFound:
 *       description: User not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             message: User with id '617268ce1a9b261b6c35cc1d' not found
 */

import { Router } from 'express';
import {
	cache,
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
import { authenticate as authentication } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const userRouter = Router();

userRouter.use(authentication);

userRouter.get(
	'/',
	checkRole(['admin']),
	validateQueryParams,
	cache(CACHE_DURATION),
	controller.getAll
);

userRouter.get('/account', controller.getAccount);

userRouter
	.route('/wishlist')
	.all(validator.validateProductEntry)
	.get(controller.getWishlist)
	.post(controller.addToWishlist)
	.delete(controller.removeFromWishlist);

userRouter
	.route('/waitlist')
	.all(validator.validateProductEntry)
	.get(controller.getWaitlist)
	.post(controller.addToWaitlist)
	.delete(controller.removeFromWaitlist);

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
	.get(
		checkRole(['admin']),
		validateId,
		cache(CACHE_DURATION),
		controller.getOne
	)
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
 * /user/account:
 *   get:
 *     summary: Get user account
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     responses:
 *       '200':
 *         description: User account
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
 *   get:
 *     summary: Get products in user's wishlist
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     responses:
 *       '200':
 *         description: All products in user's wishlist
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
 * /user/waitlist:
 *   post:
 *     summary: Add product to user's waitlist
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
 *         description: Product added to user's waitlist successfully
 *       '404':
 *         description: User or product not found
 *   delete:
 *     summary: Remove product from user's waitlist
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
 *         description: Product removed from user's waitlist successfully
 *       '404':
 *         description: User or product not found
 *   get:
 *     summary: Get products in user's waitlist
 *     security:
 *       - api_auth: []
 *     tags:
 *       - user
 *     responses:
 *       '200':
 *         description: All products in user's waitlist
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
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderResponse'
 * /user/history:
 *   post:
 *     summary: Add product to user's history
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
 *               password: '69ysGtaNk8NP4kXN'
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
 *         history: []
 *         cart: 617c9e5d4c5ad0c2a95e9b1f
 *         createdAt: 1686387456078
 *         updatedAt: 1686387456078
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

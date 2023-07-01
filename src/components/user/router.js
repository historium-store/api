import { Router } from 'express';
import {
	checkRole,
	validateId,
	validateQueryParams
} from '../../middleware.js';
import { authenticate as authentication } from '../auth/controller.js';
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
	.all(validator.validateWishlistProduct)
	.post(controller.addToWishlist)
	.delete(controller.removeFromWishlist);

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
 *             $ref: '#/components/schemas/WishlistProduct'
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
 *             $ref: '#/components/schemas/WishlistProduct'
 *     responses:
 *       '204':
 *         description: Product removed from user's wishlist successfully
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
 *         password:
 *           type: string
 *         salt:
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
 *         password: d74eef53e89912dc618537ae00e91347d78747e1dd7f6fcfa26732f23fcfa79c
 *         salt: c42af8db45f10eefb83d52cfd58a0b6e
 *         role: user
 *         reviews: []
 *         wishlist: []
 *         createdAt: 1686387456078
 *         updatedAt: 1686387456078
 *         cart: 617c9e5d4c5ad0c2a95e9b1f
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

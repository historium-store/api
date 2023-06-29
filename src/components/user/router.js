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
 * /user/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     security:
 *       - bearerAuth: []
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
 *         description: Product added to wishlist successfully
 *
 *   delete:
 *     summary: Remove product from wishlist
 *     security:
 *       - bearerAuth: []
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
 *         description: Product removed from wishlist successfully
 *
 * components:
 *   schemas:
 *     WishlistProduct:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *       example:
 *         product: 649d2022af43bbb201d8e129
 *       required:
 *         - product
 */

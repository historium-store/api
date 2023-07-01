import { Router } from 'express';
import { authenticate as authentication } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const cartItemRouter = Router();

cartItemRouter.use(authentication);

cartItemRouter
	.route('/')
	.all(validator.validateItem)
	.post(controller.addItem)
	.delete(controller.removeItem);

export default cartItemRouter;

/**
 * @swagger
 * /cart-item:
 *   post:
 *     summary: Add item to user cart
 *     security:
 *       - api_auth: []
 *     tags:
 *       - cart-item
 *     responses:
 *       '204':
 *         description: Item successfully added to cart
 *       '404':
 *         description: Cart or product not found
 *   delete:
 *     summary: Remove item from user cart
 *     security:
 *       - api_auth: []
 *     tags:
 *       - cart-item
 *     responses:
 *       '204':
 *         description: Item successfully removed from cart
 *       '404':
 *         description: Cart, product or item not found
 * components:
 *   schemas:
 *     CartItemRequest:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *         quantity:
 *           type: integer
 *       required:
 *         - product
 *       example:
 *         product: 649d2022af43bbb201d8e129
 */

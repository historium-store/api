import { Router } from 'express';
import { authenticate as authentication } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const cartRouter = Router();

cartRouter.use(authentication);

cartRouter
	.route('/')
	.get(controller.getByIdFromToken)
	.patch(validator.validateMerge, controller.merge)
	.delete(controller.clearItems);

export default cartRouter;

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get cart associated with user
 *     security:
 *       - api_auth: []
 *     tags:
 *       - cart
 *     responses:
 *       '200':
 *         description: Requested cart
 *       '404':
 *         $ref: '#/components/responses/CartNotFound'
 *   patch:
 *     summary: Merge two carts
 *     security:
 *       - api_auth: []
 *     tags:
 *       - cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CartItemRequest'
 *             example:
 *               items:
 *                 - product: 649f165553c0f327f20d2af5
 *                   quantity: 3
 *                 - product: 649d2022af43bbb201d8e129
 *     responses:
 *       '200':
 *         description: Updated cart
 *       '404':
 *         description: Cart or product not found
 *   delete:
 *     summary: Clear user cart
 *     security:
 *       - api_auth: []
 *     tags:
 *       - cart
 *     responses:
 *       '204':
 *         description: Cart cleared successfully
 *       '404':
 *         $ref: '#/components/responses/CartNotFound'
 * components:
 *   responses:
 *     CartNotFound:
 *       description: Cart not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             message: Cart with id '649f175e53c0f327f20d2af6' not found
 */

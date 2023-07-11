import { Router } from 'express';
import { validateId } from '../../middleware.js';
import { authenticate as authentication } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const reviewRouter = Router();

reviewRouter.use(authentication);

reviewRouter
	.route('/')
	.post(validator.validateCreate, controller.createOne);

reviewRouter
	.route('/:id')
	.patch(validateId, validator.validateUpdate, controller.updateOne)
	.delete(validateId, controller.deleteOne);

export default reviewRouter;

/**
 * @swagger
 * /review:
 *   post:
 *     summary: Create new review
 *     security:
 *       - api_auth: []
 *     tags:
 *       - review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               rating:
 *                 type: integer
 *             example:
 *               product: 6473b1aa394b41f5828a5e34
 *               title: Товар во 👍
 *               text: Після придбання даного товару моє життя пішло вгору
 *               rating: 5
 *     responses:
 *       '201':
 *         description: Created review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 * /review/{id}:
 *   patch:
 *     summary: Update one existing review
 *     security:
 *       - api_auth: []
 *     tags:
 *       - review
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               rating:
 *                 type: integer
 *             example:
 *               rating: 4
 *     responses:
 *       '200':
 *         description: Updated review
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReviewResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Review not found
 *   delete:
 *     summary: Delete one review
 *     security:
 *       - api_auth: []
 *     tags:
 *       - review
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Review deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Review not found
 * components:
 *   schemas:
 *     ReviewResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product:
 *           type: string
 *         user:
 *           type: string
 *         title:
 *           type: string
 *         text:
 *           type: string
 *         rating:
 *           type: integer
 *         likes:
 *           type: integer
 *         dislikes:
 *           type: integer
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       example:
 *         _id: 64acfd79cffe6bdb61920f92
 *         product: 64acfdb609fe6f3dbfe4b5d2
 *         user: 64acfd97f95ef41175576c0f
 *         title: Товар во 👍
 *         text: Після придбання даного товару моє життя пішло вгору
 *         rating: 5
 *         likes: 11
 *         dislikes: 3
 *         createdAt: 1689058866802
 *         updatedAt: 1689058866802
 */

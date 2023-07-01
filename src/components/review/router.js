import { Router } from 'express';
import { validateId, validateQueryParams } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const reviewRouter = Router();

reviewRouter
	.route('/')
	.post(authenticate, validator.validateCreate, controller.createOne)
	.get(validateQueryParams, controller.getAll);

reviewRouter
	.route('/:id')
	.get(validateId, controller.getOne)
	.patch(
		authenticate,
		validateId,
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(authenticate, validateId, controller.deleteOne);

export default reviewRouter;

/**
 * @swagger
 * /review:
 *   get:
 *     summary: Get all reviews
 *     tags:
 *       - review
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All reviews
 *   post:
 *     summary: Create new review
 *     security:
 *       - api_auth: []
 *     tags:
 *       - review
 *     responses:
 *       '201':
 *         description: Created review
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 * /review/{id}:
 *   get:
 *     summary: Get one review
 *     tags:
 *       - review
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested review
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Review not found
 *   patch:
 *     summary: Update one existing review
 *     security:
 *       - api_auth: []
 *     tags:
 *       - review
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested review
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
 */

import { Router } from 'express';
import { checkRole, validateQueryParams } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const sectionRouter = Router();

sectionRouter
	.route('/')
	.get(validateQueryParams, controller.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validator.validateCreate,
		controller.createOne
	);

sectionRouter.get(
	'/:id/products',
	validateQueryParams,
	controller.getProducts
);

sectionRouter
	.route('/:id')
	.get(validateQueryParams, controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin']),
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(authenticate, checkRole(['admin']), controller.deleteOne);

export default sectionRouter;

/**
 * @swagger
 * /section:
 *   post:
 *     summary: Create new section
 *     security:
 *       - api_auth: []
 *     tags:
 *       - section
 *     responses:
 *       '201':
 *         description: Created section
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '409':
 *         description: Section already exists
 *   get:
 *     summary: Get all sections
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/orderBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       '200':
 *         description: All sections
 * /section/{id}:
 *   get:
 *     summary: Get one section
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested section
 *       '404':
 *         description: Section not found
 *   patch:
 *     summary: Update one existing section
 *     security:
 *       - api_auth: []
 *     tags:
 *       - section
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               key:
 *                 type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               sections:
 *                 - 649f1b8853c0f327f20d2b46
 *                 - 649f1b8853c0f327f20d2b3e
 *     responses:
 *       '200':
 *         description: Updated section
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Section not found
 *       '409':
 *         description: Section already exists
 *   delete:
 *     summary: Get one section
 *     security:
 *       - api_auth: []
 *     tags:
 *       - section
 *     responses:
 *       '200':
 *         description: Requested section
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Section not found
 * /section/{id}/products:
 *   get:
 *     summary: Get all section products
 *     tags:
 *       - section
 *     responses:
 *       '200':
 *         description: All section products
 * components:
 *   schemas:
 *     SectionResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         key:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             type: string
 *         sections:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       example:
 *         _id: 649f1b8853c0f327f20d2b1f
 *         name: Саморозвиток і мотивація
 *         key: samorozvytok-i-motyvaciya
 *         products:
 *           - 649d2022af43bbb201d8e129
 *         sections:
 *           - 649f1b8853c0f327f20d2b46
 *         createdAt: 1687101928409
 *         updatedAt: 1687101928409
 */

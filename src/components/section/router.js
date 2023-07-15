import { Router } from 'express';
import {
	cache,
	checkRole,
	validateQueryParams
} from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const sectionRouter = Router();

sectionRouter
	.route('/')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validator.validateCreate,
		controller.createOne
	);

sectionRouter.get('/tree', controller.getSectionsTree);

sectionRouter.get('/names', controller.getSectionNames);

sectionRouter.get(
	'/:id/products',
	validateQueryParams,
	cache(CACHE_DURATION),
	controller.getProducts
);

sectionRouter
	.route('/:id')
	.get(validateQueryParams, cache(CACHE_DURATION), controller.getOne)
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
 *     requestBody:
 *       required: true
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
 *             required:
 *               - name
 *               - key
 *             examples:
 *               - name: Саморозвиток і мотивація
 *                 key: samorozvytok-i-motyvaciya
 *     responses:
 *       '201':
 *         description: Created section
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SectionResponse'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SectionResponse'
 * /section/tree:
 *   get:
 *     summary: Get all sections starting from the root ones
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SectionResponse'
 * /section/names:
 *   get:
 *     summary: Get all sections' names
 *     tags:
 *       - section
 *     responses:
 *       '200':
 *         description: All sections
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
 *                 examples:
 *                   - _id: 64b309f41cc1eb8aebe52c3d
 *                     name: Вибір читачів
 * /section/{id}:
 *   get:
 *     summary: Get one section by id
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested section
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SectionResponse'
 *       '404':
 *         description: Section not found
 *   patch:
 *     summary: Update one existing section by id
 *     security:
 *       - api_auth: []
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/id'
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
 *             examples:
 *               - sections:
 *                   - 649f1b8853c0f327f20d2b46
 *                   - 649f1b8853c0f327f20d2b3e
 *     responses:
 *       '200':
 *         description: Updated section
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SectionResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Section not found
 *       '409':
 *         description: Section already exists
 *   delete:
 *     summary: Delete one section by id
 *     security:
 *       - api_auth: []
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Section deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Section not found
 * /section/{id}/products:
 *   get:
 *     summary: Get all section products by id
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: All section products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 *       '404':
 *         description: Section not found
 * /section/{key}:
 *   get:
 *     summary: Get one section by key
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/key'
 *     responses:
 *       '200':
 *         description: Requested section
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SectionResponse'
 *       '404':
 *         description: Section not found
 *   patch:
 *     summary: Update one existing section by key
 *     security:
 *       - api_auth: []
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/key'
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
 *             examples:
 *               - sections:
 *                   - 649f1b8853c0f327f20d2b46
 *                   - 649f1b8853c0f327f20d2b3e
 *     responses:
 *       '200':
 *         description: Updated section
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SectionResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Section not found
 *       '409':
 *         description: Section already exists
 *   delete:
 *     summary: Delete one section by key
 *     security:
 *       - api_auth: []
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/key'
 *     responses:
 *       '204':
 *         description: Section deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         description: Section not found
 * /section/{key}/products:
 *   get:
 *     summary: Get all section products by key
 *     tags:
 *       - section
 *     parameters:
 *       - $ref: '#/components/parameters/key'
 *     responses:
 *       '200':
 *         description: All section products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 *       '404':
 *         description: Section not found
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

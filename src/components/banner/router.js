import { Router } from 'express';
import { cache, checkRole, validateId } from '../../middleware.js';
import { CACHE_DURATION } from '../../utils.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const bannerRouter = Router();

bannerRouter
	.route('/')
	.get(cache(CACHE_DURATION), controller.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validator.validateCreate,
		controller.createOne
	);

bannerRouter
	.route('/:id')
	.get(validateId, cache(CACHE_DURATION), controller.getOne)
	.patch(
		authenticate,
		checkRole(['admin']),
		validateId,
		validator.validateUpdate,
		controller.updateOne
	)
	.delete(
		authenticate,
		checkRole(['admin']),
		validateId,
		controller.deleteOne
	);

export default bannerRouter;

/**
 * @swagger
 * /banner:
 *   post:
 *     summary: Create new banner
 *     security:
 *       - api_auth: []
 *     tags:
 *       - banner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadsTo:
 *                 type: string
 *               imageRect:
 *                 type: string
 *               imageSquare:
 *                 type: string
 *             required:
 *               - leadsTo
 *               - imageRect
 *               - imageSquare
 *             example:
 *               leadsTo: /path/to/resource
 *               imageRect: url-to-wide-image
 *               imageSquare: url-to-compact-image
 *     responses:
 *       '201':
 *         description: Created banner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BannerResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all banners
 *     tags:
 *       - banner
 *     responses:
 *       '200':
 *         description: All banners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BannerResponse'
 * /banner/{id}:
 *   get:
 *     summary: Get one banner
 *     tags:
 *       - banner
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '200':
 *         description: Requested banner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BannerResponse'
 *       '404':
 *         $ref: '#/components/responses/BannerNotFound'
 *   patch:
 *     summary: Update one existing banner
 *     security:
 *       - api_auth: []
 *     tags:
 *       - banner
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadsTo:
 *                 type: string
 *               imageRect:
 *                 type: string
 *               imageSquare:
 *                 type: string
 *             example:
 *               leadsTo: /path/to/new/resource
 *               imageRect: url-to-new-wide-image
 *               imageSquare: url-to-new-compact-image
 *     responses:
 *       '200':
 *         description: Updated banner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BannerResponse'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/BannerNotFound'
 *   delete:
 *     summary: Delete one banner
 *     security:
 *       - api_auth: []
 *     tags:
 *       - banner
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       '204':
 *         description: Banner deleted successfully
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/BannerNotFound'
 * components:
 *   schemas:
 *     BannerResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         leadsTo:
 *           type: string
 *         imageRect:
 *           type: string
 *         imageSquare:
 *           type: string
 *         createdAt:
 *           type: integer
 *         updatedAt:
 *           type: integer
 *       example:
 *         _id: 649e6920b1a3a571dcd452ab
 *         leadsTo: /path/to/resource
 *         imageRect: url-to-wide-image
 *         imageSquare: url-to-compact-image
 *         createdAt: 1687101928409
 *         updatedAt: 1687101928409
 *   responses:
 *     BannerNotFound:
 *       description: Banner not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             message: Banner with id '649e6920b1a3a571dcd452ab' not found
 */

import { Router } from 'express';
import { checkRole, validateId } from '../../middleware.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';
import validator from './validator.js';

const bannerRouter = Router();

bannerRouter
	.route('/')
	.get(controller.getAll)
	.post(
		authenticate,
		checkRole(['admin']),
		validator.validateCreate,
		controller.createOne
	);

bannerRouter
	.route('/:id')
	.get(validateId, controller.getOne)
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
 *     security:
 *       - bearerAuth: []
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
 *           example:
 *             leadsTo: /path/to/resource
 *             imageRect: url-to-wide-image
 *             imageSquare: url-to-compact-image
 *           required:
 *             - leadsTo
 *             - imageRect
 *             - imageSquare
 *     responses:
 *       '201':
 *         description: Banner created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Banner'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     tags:
 *       - banner
 *     responses:
 *       '200':
 *         description: All banners served successfully
 *         content:
 *           application/json:
 *             schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Banner'
 *             example:
 *               - _id: 648f20f4d6197b880bd9380c
 *                 leadsTo: /book?orderBy=createdAt
 *                 imageRect: url-to-wide-image
 *                 imageSquare: url-to-compact-image
 *                 createdAt: 1687101928409
 *                 updatedAt: 1687101928409
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *
 * /banner/{id}:
 *   get:
 *     tags:
 *       - banner
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 648f20f4d6197b880bd9380c
 *         required: true
 *         description: Mongo id of a banner
 *     responses:
 *       '200':
 *         description: Banner served successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Banner'
 *       '404':
 *         $ref: '#/components/responses/BannerNotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - banner
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 648f20f4d6197b880bd9380c
 *         required: true
 *         description: Mongo id of a banner
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
 *           example:
 *             leadsTo: /new/path/to/resource
 *             imageRect: url-to-new-wide-image
 *             imageSquare: url-to-new-compact-image
 *     responses:
 *       '200':
 *         description: Banner updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Banner'
 *       '404':
 *         $ref: '#/components/responses/BannerNotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - banner
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 648f20f4d6197b880bd9380c
 *         required: true
 *         description: Mongo id of a banner
 *     responses:
 *       '204':
 *         description: Banner deleted successfully
 *       '404':
 *         $ref: '#/components/responses/BannerNotFoundError'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Banner:
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
 *           type: number
 *         updatedAt:
 *           type: number
 *       example:
 *         _id: 648f20f4d6197b880bd9380c
 *         leadsTo: /path/to/resource
 *         imageRect: url-to-wide-image
 *         imageSquare: url-to-compact-image
 *         createdAt: 1687101928409
 *         updatedAt: 1687101928409
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           default: Internal server error
 *
 *   responses:
 *     Unauthorized:
 *       description: Authorization token is missing, invalid or expired
 *     Forbidden:
 *       description: No permission to use the endpoint
 *     BannerNotFoundError:
 *       description: Banner not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             message: Banner with id '648f20f4d6197b880bd9380c' not found
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */

import { Router } from 'express';
import { checkRole } from '../../middleware.js';
import { upload } from '../../utils.js';
import { authenticate } from '../auth/controller.js';
import controller from './controller.js';

const fileRouter = Router();

fileRouter.post(
	'/',
	authenticate,
	checkRole(['admin', 'seller']),
	upload.array('files'),
	controller.upload
);

export default fileRouter;

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload file(s)
 *     security:
 *       - api_auth: []
 *     tags:
 *       - file
 *     responses:
 *       '200':
 *         description: URL(s) to uploaded file(s)
 */

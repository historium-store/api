import { Router } from 'express';
import createHttpError from 'http-errors';
import { authenticate } from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateId,
	validateUpdate
} from '../schemas/userValidation.js';

const router = Router();

router.get('/account', authenticate, (req, res) => {
	res.json({ status: 'OK', data: req.user });
});

router
	.route('/:id')
	.get(
		authenticate,
		checkRole(['admin']),
		validateId,
		userController.getOne
	)
	.patch(
		authenticate,
		validateUpdate,
		(req, res, next) => {
			if (req.user.id === req.params.id) {
				return next();
			}

			next(createHttpError(403));
		},
		userController.updateOne
	)
	.delete(
		authenticate,
		validateId,
		(req, res, next) => {
			if (req.user.id === req.params.id) {
				return next();
			}

			next(createHttpError(403));
		},
		userController.deleteOne
	);

router.get(
	'/',
	authenticate,
	checkRole(['admin']),
	userController.getAll
);

export default router;

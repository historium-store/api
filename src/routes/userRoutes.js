import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import userController from '../controllers/userController.js';
import { checkRole, checkSameIdOrRole } from '../middleware/index.js';
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
		checkSameIdOrRole(['admin']),
		userController.updateOne
	)
	.delete(
		authenticate,
		validateId,
		checkSameIdOrRole(['admin']),
		userController.deleteOne
	);

router.get(
	'/',
	authenticate,
	checkRole(['admin']),
	userController.getAll
);

export default router;

import { Router } from 'express';
import { authenticate } from '../controllers/authController.js';
import productController from '../controllers/productController.js';
import { checkRole } from '../middleware/index.js';
import {
	validateCreate,
	validateId,
	validateUpdate
} from '../schemas/productValidation.js';

const router = Router();

router.use(authenticate, checkRole(['admin']));

router
	.route('/')
	.get(productController.getAll)
	.post(validateCreate, productController.createOne);

router
	.route('/:id')
	.get(validateId, productController.getOne)
	.patch(validateUpdate, productController.updateOne)
	.delete(validateId, productController.deleteOne);

export default router;

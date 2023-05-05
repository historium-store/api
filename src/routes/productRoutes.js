import { Router } from 'express';
import productController from '../controllers/productController.js';

const router = new Router();

router
	.route('/')
	.get(productController.getAll)
	.post(productController.createOne);

router
	.route('/:id')
	.get(productController.getOne)
	.patch(productController.updateOne)
	.delete(productController.deleteOne);

export default router;

import { Router } from 'express';
import userController from '../controllers/userController.js';

const router = new Router();

router
	.route('/:id')
	.get(userController.getOne)
	.patch(userController.updateOne);

export default router;

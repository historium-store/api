import { Router } from 'express';
import bookController from '../controllers/bookController.js';

const router = new Router();

router.route('/').post(bookController.createOne);

export default router;

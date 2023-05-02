import { Router } from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';

const router = new Router();

router.post('/signup', userController.createOne);

router.post('/login', authController.createNewToken);

// will be deleted
router.get('/protected', authController.authenticate, (req, res) => {
	res.json({
		status: 'OK',
		data: { id: req.user.id }
	});
});

export default router;

import { pbkdf2, randomBytes, timingSafeEqual } from 'crypto';
import { Router } from 'express';
import createHttpError from 'http-errors';
import jwt from '../middleware/jwt.js';
import User from '../models/user.js';

const router = new Router();

router.post('/signup', async (req, res, next) => {
	// destructure request body
	const { email, password } = req.body;

	// search for user
	// return 409 if exists
	if (await User.findOne({ email })) {
		return next(createHttpError(409, 'User already exists'));
	}

	// otherwise hash the password
	const salt = randomBytes(16);
	let hash = null;
	try {
		hash = await new Promise((resolve, reject) => {
			pbkdf2(password, salt, 310000, 32, 'sha256', (err, hash) =>
				err ? reject() : resolve(hash)
			);
		});
	} catch {
		return next(createHttpError(500));
	}

	// create user
	const id = await User.create({
		email,
		password: hash,
		salt
	});

	// and return his id
	res.json({ id });
});

router.post(
	'/login',
	async (req, res, next) => {
		//destructure request body
		const { email, password } = req.body;

		// search for user
		// return 401 if doesn't exist
		const user = await User.findOne({ email });
		if (!user) {
			return next(createHttpError(401, 'User not found'));
		}

		// otherwise hash the incoming password
		let hash = null;
		try {
			hash = await new Promise((resolve, reject) => {
				pbkdf2(password, user.salt, 310000, 32, 'sha256', (err, hash) =>
					err ? reject(err) : resolve(hash)
				);
			});
		} catch (err) {
			return next(err);
		}

		// compare incoming password with the saved one
		// return 401 if not equal
		try {
			await new Promise((resolve, reject) =>
				timingSafeEqual(hash, user.password) ? resolve() : reject()
			);
		} catch {
			return next(createHttpError(401, 'Incorrect password'));
		}

		// otherwise create and return new token
		req.user = user;
		next();
	},
	jwt.sign
);

// will be deleted
router.get('/protected', jwt.verify, (req, res) => {
	res.json({ id: req.user.id });
});

export default router;

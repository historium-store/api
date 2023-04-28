import { pbkdf2, randomBytes, timingSafeEqual } from 'crypto';
import { Router } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import config from '../config/main.js';
import validateBody from '../middleware/body-validator.js';
import authenticate from '../middleware/jwt-authenticator.js';
import User from '../models/user.js';

const router = new Router();
const secret = process.env.SECRET || config.SECRET;

router.post('/signup', validateBody, async (req, res, next) => {
	const { email, password } = req.body;

	// search for user
	// pass 409 to error handler if exists
	if (await User.findOne({ email })) {
		return next(createHttpError(409, 'User already exists'));
	}

	// hash the password
	// pass to error handler if hashing failed
	const salt = randomBytes(16);
	let hash = null;
	try {
		hash = await new Promise((resolve, reject) => {
			pbkdf2(password, salt, 310000, 32, 'sha256', (err, hash) =>
				err ? reject(err) : resolve(hash)
			);
		});
	} catch (err) {
		return next(err);
	}

	// create new user
	// respond with his id
	const id = await User.create({
		email,
		password: hash,
		salt
	});
	res.json({ id });
});

router.post('/login', validateBody, async (req, res, next) => {
	const { email, password } = req.body;

	// search for user
	// pass 401 to error handler if doesn't exist
	const user = await User.findOne({ email });
	if (!user) {
		return next(createHttpError(401, 'User not found'));
	}

	// hash the incoming password
	// pass to error handler if hashing failed
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
	// pass 401 to error handler if not equal
	try {
		await new Promise((resolve, reject) =>
			timingSafeEqual(hash, user.password) ? resolve() : reject()
		);
	} catch {
		return next(createHttpError(401, 'Incorrect password'));
	}

	// sign new token
	// respond with it
	const payload = { sub: user.id };
	const options = {
		expiresIn: config.JWT_EXPIRATION,
		noTimestamp: true
	};
	const token = jwt.sign(payload, secret, options);
	res.json({ token });
});

// will be deleted
router.get('/protected', authenticate, (req, res) => {
	res.json({ id: req.user.id });
});

export default router;

import { pbkdf2, randomBytes, timingSafeEqual } from 'crypto';
import { Router } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import config from '../config/main.js';
import User from '../models/user.js';

const secret = process.env.SECRET ?? config.SECRET;
const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secret
};
const verify = async (payload, done) => {
	// check if token is expired
	// cancel authorization if it is
	const expiresIn = payload.iat + config.JWT_EXPIRATION;
	const now = Date.now() / 1000;
	if (expiresIn < now) {
		return done(createHttpError(401, 'Token expired'));
	}

	// otherwise search for user
	// return if found
	// 404 if not
	// 500 if query failed
	try {
		const user = await User.findOne({ id: payload.sub });

		if (user) {
			return done(null, user);
		}

		done(createHttpError(404, 'User not found'));
	} catch {
		done(createHttpError(500));
	}
};
const strategy = new JWTStrategy(options, verify);

passport.use(strategy);

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

router.post('/login', async (req, res, next) => {
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

	// otherwise create new token and return it
	const payload = { sub: user.id };
	const token = jwt.sign(payload, secret);
	res.json({ token });
});

// will be deleted
router.get(
	'/protected',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		res.json({ id: req.user.id });
	}
);

export default router;

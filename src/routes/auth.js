import { pbkdf2, randomBytes, timingSafeEqual } from 'crypto';
import { Router } from 'express';
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
	try {
		const user = User.findOneByEmail(payload.email);

		if (user) {
			return done(null, user);
		}

		done(null, false);
	} catch (err) {
		done(err, false);
	}
};
const strategy = new JWTStrategy(options, verify);

passport.use(strategy);

const router = new Router();

router.post('/signup', async (req, res, next) => {
	const { email, password } = req.body;
	if (await User.findOneByEmail(email)) {
		return res.status(409).json({ message: 'Email already exists' });
	}

	const salt = randomBytes(16);
	let hashedPassword = null;

	try {
		hashedPassword = await new Promise((resolve, reject) => {
			pbkdf2(
				password,
				salt,
				310000,
				32,
				'sha256',
				(err, hashedPassword) => {
					if (err) {
						reject(err);
					}

					resolve(hashedPassword);
				}
			);
		});
	} catch (err) {
		return next(err);
	}

	const user = await User.create({
		email,
		password: hashedPassword,
		salt
	});

	res.json(user);
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOneByEmail(email);
	if (!user) {
		return res.status(404).json({ message: 'Email not found' });
	}

	let hashedPassword = null;
	try {
		hashedPassword = await new Promise((resolve, reject) => {
			pbkdf2(
				password,
				user.salt,
				310000,
				32,
				'sha256',
				(err, hashedPassword) => {
					if (err) {
						reject(err);
					}

					resolve(hashedPassword);
				}
			);
		});
	} catch (err) {
		return next(err);
	}

	try {
		await new Promise((resolve, reject) => {
			if (timingSafeEqual(user.password, hashedPassword)) {
				resolve();
			}

			reject();
		});
	} catch (err) {
		return res
			.status(401)
			.json({ message: 'Incorrect username or password' });
	}

	const payload = { sub: user.id, email: user.email };
	const token = jwt.sign(payload, secret);
	res.json({ token });
});

// will be deleted
router.get(
	'/protected',
	passport.authenticate('jwt', { session: false }),
	(req, res) => {
		res.sendStatus(200);
	}
);

export default router;

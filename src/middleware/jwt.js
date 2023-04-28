import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import config from '../config/main.js';
import User from '../models/user.js';

const secret = process.env.SECRET ?? config.SECRET;
const nameToError = new Map();
nameToError.set('TokenExpiredError', () =>
	createHttpError(401, 'Token has expired')
);
nameToError.set('JsonWebTokenError', () =>
	createHttpError(401, 'Invalid token')
);

const verify = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return next(createHttpError(401, 'Header not provided'));
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		return next(createHttpError(401, 'Token not provided'));
	}

	let payload = null;
	try {
		payload = await new Promise((resolve, reject) => {
			jwt.verify(token, secret, (err, payload) => {
				if (!err) {
					resolve(payload);
				}

				reject(nameToError.get(err.name)());
			});
		});
	} catch (err) {
		return next(err);
	}

	try {
		const user = await User.findOne({ id: payload.sub });

		if (user) {
			req.user = user;
			return next();
		}

		next(createHttpError(404, 'User not found'));
	} catch {
		next(createHttpError(500));
	}
};

const sign = (req, res) => {
	const payload = { sub: req.user.id };
	const options = {
		expiresIn: config.JWT_EXPIRATION,
		noTimestamp: true
	};
	const token = jwt.sign(payload, secret, options);
	res.json({ token });
};

export default { verify, sign };

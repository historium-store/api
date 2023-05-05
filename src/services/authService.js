import { pbkdf2Sync, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/main.js';
import User from '../models/user.js';

const SECRET = process.env.SECRET || config.SECRET;

const createToken = credentials => {
	const { phoneNumber, email, password } = credentials;

	let user = null;
	try {
		user = User.getOne(phoneNumber ? { phoneNumber } : { email });

		const hashedPassword = pbkdf2Sync(
			password,
			Buffer.from(user.salt, 'hex'),
			310000,
			32,
			'sha256'
		);

		const userPassword = Buffer.from(user.password, 'hex');

		if (!timingSafeEqual(userPassword, hashedPassword)) {
			throw {
				status: 400,
				message: 'Incorrect password'
			};
		}
	} catch (err) {
		throw err;
	}

	const payload = { sub: user.id };
	const options = {
		expiresIn: config.JWT_EXPIRATION,
		noTimestamp: true
	};
	const token = jwt.sign(payload, SECRET, options);

	return token;
};

const authenticate = async authHeader => {
	if (!authHeader) {
		throw {
			status: 401,
			message: 'Authorization header not provided'
		};
	}

	const token = authHeader.split(' ')[1];
	if (!token) {
		throw {
			status: 401,
			message: 'Token not provided'
		};
	}

	let payload = null;
	try {
		payload = await new Promise((resolve, reject) =>
			jwt.verify(token, SECRET, (err, payload) => {
				if (err) {
					reject({
						status: 401,
						message:
							err.name === 'TokenExpiredError'
								? 'Token has expired'
								: 'Invalid token'
					});
				}

				resolve(payload);
			})
		);
	} catch (err) {
		throw err;
	}

	let user = null;
	try {
		user = User.getOne({ id: payload.sub });
	} catch (err) {
		throw err;
	}

	return user;
};

export default { createToken, authenticate };

import { timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/main.js';
import User from '../models/User.js';
import { hashPassword, verifyJWT } from '../models/utils.js';

const SECRET = process.env.SECRET || config.SECRET;
const EXPIRES_IN =
	process.env.JWT_EXPIRATION || config.JWT_EXPIRATION;

const createToken = async credentials => {
	const { phoneNumber, email, password } = credentials;

	let user = null;
	try {
		user = User.getOne(phoneNumber ? { phoneNumber } : { email });

		const hashedPassword = await hashPassword(
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
		expiresIn: EXPIRES_IN,
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
		payload = await verifyJWT(token, SECRET);
	} catch (err) {
		throw {
			status: 401,
			message:
				err.name === 'TokenExpiredError'
					? 'Token has expired'
					: 'Invalid token'
		};
	}

	try {
		return User.getOne({ id: payload.sub });
	} catch (err) {
		throw err;
	}
};

export default { createToken, authenticate };

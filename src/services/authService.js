import { randomBytes, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { hashPassword, verifyJWT } from '../utils/index.js';

const EXPIRES_IN = process.env.JWT_EXPIRATION;
const SECRET = process.env.SECRET;

const signup = async userData => {
	try {
		const salt = randomBytes(16);
		const hashedPassword = await hashPassword(
			userData.password,
			salt,
			310000,
			32,
			'sha256'
		);

		return await User.create({
			...userData,
			password: hashedPassword.toString('hex'),
			salt: salt.toString('hex')
		});
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

const login = async credentials => {
	const { phoneNumber, email, password } = credentials;

	try {
		const user = await User.findOne(
			phoneNumber ? { phoneNumber } : { email }
		);

		const hashedPassword = await hashPassword(
			password,
			Buffer.from(user.salt, 'hex'),
			310000,
			32,
			'sha256'
		);

		const savedPassword = Buffer.from(user.password, 'hex');

		if (!timingSafeEqual(savedPassword, hashedPassword)) {
			throw {
				status: 400,
				message: 'Incorrect password'
			};
		}

		const payload = { sub: user.id };
		const options = {
			expiresIn: EXPIRES_IN,
			noTimestamp: true
		};
		return jwt.sign(payload, SECRET, options);
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
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

	try {
		const payload = await verifyJWT(token, SECRET);

		return await User.findById(payload.sub);
	} catch (err) {
		if (err.name) {
			throw {
				status: 401,
				message:
					err.name === 'TokenExpiredError'
						? 'Token has expired'
						: 'Invalid token format'
			};
		}
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

export default { signup, login, authenticate };

import { timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { hashPassword, verifyJWT } from '../utils/promisified.js';
import userService from './userService.js';

const EXPIRES_IN = process.env.JWT_EXPIRATION;
const SECRET = process.env.SECRET;

const signup = async userData => {
	const user = await User.findOne({
		$or: [
			{ phoneNumber: userData.phoneNumber },
			{ email: userData.email }
		]
	});

	if (user) {
		throw {
			status: 409,
			message:
				'User with ' +
				(user.phoneNumber === userData.phoneNumber
					? `phone number '${userData.phoneNumber}'`
					: `email '${userData.email}'`) +
				' already exists'
		};
	}

	try {
		return await userService.createOne(userData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const login = async credentials => {
	const { phoneNumber, email, password } = credentials;

	try {
		const user = await User.findOne(
			phoneNumber ? { phoneNumber } : { email }
		);

		if (!user) {
			throw {
				status: 404,
				message:
					'User with ' +
					(phoneNumber
						? `phone number '${phoneNumber}'`
						: `email '${email}'`) +
					' not found'
			};
		}

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
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
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
		const { sub: id } = await verifyJWT(token, SECRET);
		const user = await User.findById(id);

		if (!user) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		return user;
	} catch (err) {
		let status;
		let message;
		switch (err.name) {
			case 'TokenExpiredError':
				status = 401;
				message = 'Token has expired';
				break;
			case 'JsonWebTokenError':
				status = 401;
				message = 'Invalid token format';
				break;
			default:
				status = err.status ?? 500;
				message = err.message ?? err;
		}

		throw { status, message };
	}
};

export default { signup, login, authenticate };

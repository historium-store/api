import { randomBytes, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { hashPassword, verifyJWT } from '../utils/promisified.js';

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

		// проверка на совпадение паролей
		if (!timingSafeEqual(savedPassword, hashedPassword)) {
			throw {
				status: 400,
				message: 'Incorrect password'
			};
		}

		// создание и подпись токена
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

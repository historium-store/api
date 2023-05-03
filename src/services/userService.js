import {
	pbkdf2Sync,
	randomBytes,
	randomUUID,
	timingSafeEqual
} from 'crypto';
import User from '../models/user.js';

const createOne = user => {
	let exists = null;
	try {
		exists = User.getOne({ email: user.email });
	} catch {}

	if (exists) {
		throw {
			status: 400,
			message: 'User already exists'
		};
	}

	let createdUser = null;
	try {
		const salt = randomBytes(16);
		const hashedPassword = pbkdf2Sync(
			user.password,
			salt,
			310000,
			32,
			'sha256'
		);

		createdUser = User.createOne({
			id: randomUUID(),
			email: user.email,
			password: hashedPassword.toString('hex'),
			salt: salt.toString('hex')
		});
	} catch (err) {
		throw err;
	}

	return createdUser;
};

const getOne = credentials => {
	let user = null;
	try {
		user = User.getOne({ email: credentials.email });

		const hashedPassword = pbkdf2Sync(
			credentials.password,
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

	return user;
};

export default { createOne, getOne };

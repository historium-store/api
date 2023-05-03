import {
	pbkdf2Sync,
	randomBytes,
	randomUUID,
	timingSafeEqual
} from 'crypto';
import User from '../models/user.js';

const createOne = userData => {
	if (User.exists({ phoneNumber: userData.phoneNumber })) {
		throw {
			status: 400,
			message: `User with phone number '${userData.phoneNumber}' already exists`
		};
	}

	if (User.exists({ email: userData.email })) {
		throw {
			status: 400,
			message: `User with email '${userData.email}' already exists`
		};
	}

	let user = null;
	try {
		const salt = randomBytes(16);
		const hashedPassword = pbkdf2Sync(
			userData.password,
			salt,
			310000,
			32,
			'sha256'
		);

		user = User.createOne({
			id: randomUUID(),
			...userData,
			password: hashedPassword.toString('hex'),
			salt: salt.toString('hex')
		});
	} catch (err) {
		throw err;
	}

	return user;
};

const getOne = credentials => {
	let user = null;
	try {
		if (credentials.phoneNumber) {
			user = User.getOne({ phoneNumber: credentials.phoneNumber });
		} else {
			user = User.getOne({ email: credentials.email });
		}

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

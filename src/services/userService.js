import { pbkdf2, randomBytes, randomUUID } from 'crypto';
import { promisify } from 'util';
import User from '../models/user.js';

const createOne = async userData => {
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
		const hashPassword = promisify(pbkdf2);
		const salt = randomBytes(16);
		const hashedPassword = await hashPassword(
			userData.password,
			salt,
			310000,
			32,
			'sha256'
		);

		const date = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});

		user = User.createOne({
			id: randomUUID(),
			createdAt: date,
			updatedAt: date,
			...userData,
			password: hashedPassword.toString('hex'),
			salt: salt.toString('hex')
		});
	} catch (err) {
		throw err;
	}

	return user;
};

const getOne = id => {
	let user = null;
	try {
		user = User.getOne({ id });
	} catch (err) {
		throw err;
	}

	return user;
};

const updateOne = (id, changes) => {
	let user = null;
	try {
		user = User.updateOne(id, changes);
	} catch (err) {
		throw err;
	}

	return user;
};

export default { createOne, getOne, updateOne };

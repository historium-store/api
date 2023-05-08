import { randomBytes, randomUUID } from 'crypto';
import User from '../models/User.js';
import { hashPassword } from '../models/utils.js';

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

	try {
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

		return User.createOne({
			id: randomUUID(),
			createdAt: date,
			updatedAt: date,
			deletedAt: null,
			firstName: userData.firstName,
			lastName: userData.lastName,
			phoneNumber: userData.phoneNumber,
			email: userData.email,
			role: userData.role,
			password: hashedPassword.toString('hex'),
			salt: salt.toString('hex')
		});
	} catch (err) {
		throw err;
	}
};

const getOne = id => {
	try {
		return User.getOne({ id });
	} catch (err) {
		throw err;
	}
};

const updateOne = async (id, changes) => {
	try {
		if (changes.password) {
			const salt = randomBytes(16);
			const hashedPassword = await hashPassword(
				changes.password,
				salt,
				310000,
				32,
				'sha256'
			);

			changes.password = hashedPassword.toString('hex');
			changes.salt = salt.toString('hex');
		}

		return User.updateOne(id, changes);
	} catch (err) {
		throw err;
	}
};

export default { createOne, getOne, updateOne };

import { randomBytes } from 'crypto';
import User from '../models/User.js';
import { hashPassword } from '../utils/promisified.js';

const createOne = async userData => {
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

const getOne = async id => {
	try {
		return await User.findById(id);
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

		return await User.findByIdAndUpdate(id, changes, { new: true });
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

export default { createOne, getOne, updateOne };

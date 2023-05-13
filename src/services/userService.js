import { randomBytes } from 'crypto';
import { User } from '../models/index.js';
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
		const user = await User.findById(id);

		if (!user) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		return user;
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
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

		const user = await User.findByIdAndUpdate(id, changes, {
			new: true
		});

		if (!user) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		return user;
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

export default { createOne, getOne, updateOne };

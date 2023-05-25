import { randomBytes } from 'crypto';
import { hashPassword } from '../../utils.js';
import User from './model.js';

const createOne = async userData => {
	const { phoneNumber, email } = userData;

	try {
		const foundUser = await User.findOne({
			$or: [{ phoneNumber }, { email }]
		});

		if (foundUser) {
			throw {
				status: 409,
				message:
					'User with ' +
					(foundUser.phoneNumber === phoneNumber
						? `phone number '${phoneNumber}'`
						: `email '${email}'`) +
					' already exists'
			};
		}

		const salt = randomBytes(16);
		const hashedPassword = await hashPassword(
			userData.password,
			salt,
			310000,
			32,
			'sha256'
		);
		userData.password = hashedPassword.toString('hex');
		userData.salt = salt.toString('hex');

		return await User.create(userData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
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
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await User.find();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { phoneNumber, email } = changes;

	try {
		if (!(await User.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		const userToUpdate = await User.findOne({
			$or: [{ phoneNumber }, { email }]
		});

		if (userToUpdate) {
			throw {
				status: 409,
				message:
					'User with ' +
					(userToUpdate.phoneNumber === phoneNumber
						? `phone number '${phoneNumber}'`
						: `email '${email}'`) +
					' already exists'
			};
		}

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
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const userToDelete = await User.findById(id);

		if (!userToDelete) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		await userToDelete.deleteOne();

		return userToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne
};

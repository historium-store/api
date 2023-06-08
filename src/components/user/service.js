import { randomBytes } from 'crypto';
import { hashPassword } from '../../utils.js';
import Cart from '../cart/model.js';
import User from './model.js';

const createOne = async userData => {
	const { phoneNumber, email } = userData;

	try {
		const foundUser = await User.findOne({
			$or: [
				{ phoneNumber, deletedAt: { $exists: false } },
				{ email, deletedAt: { $exists: false } }
			]
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

		const newUser = await User.create(userData);

		const newCart = await Cart.create({ user: newUser.id });

		await newUser.updateOne({ cart: newCart.id });

		return await User.findById(newUser.id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundUser = await User.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!foundUser) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		return foundUser;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip, orderBy, order } = queryParams;

	const filter = {
		deletedAt: { $exists: false }
	};

	try {
		return await User.find(filter)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order });
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
		const userToUpdate = await User.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!userToUpdate) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		const foundUser = await User.findOne({
			$or: [
				{ phoneNumber, deletedAt: { $exists: false } },
				{ email, deletedAt: { $exists: false } }
			]
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
		const userToDelete = await User.findOne({
			_id: id,
			deletedAt: { $exists: false }
		});

		if (!userToDelete) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		await Cart.deleteOne({ user: id });

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

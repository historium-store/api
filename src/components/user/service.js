import { randomBytes } from 'crypto';
import { hashPassword } from '../../utils.js';
import Cart from '../cart/model.js';
import cartService from '../cart/service.js';
import User from './model.js';

const createOne = async userData => {
	const { phoneNumber, email } = userData;

	try {
		const existingUser = await User.where('deletedAt')
			.exists(false)
			.or([{ phoneNumber }, { email }])
			.findOne();

		if (existingUser) {
			throw {
				status: 409,
				message:
					'User with ' +
					(existingUser.phoneNumber === phoneNumber
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
		const newCart = await Cart.create({ user: newUser });
		newUser.cart = newCart.id;
		await newUser.save();

		return newUser;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async (id, withDeleted) => {
	try {
		const query = User.where('_id').equals(id);

		if (!withDeleted) {
			query.where('deletedAt').exists(false);
		}

		const foundUser = await query.findOne();

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
	const {
		limit,
		offset: skip,
		orderBy,
		order,
		withDeleted
	} = queryParams;

	try {
		const query = User.find();

		if (!withDeleted) {
			query.where('deletedAt').exists(false);
		}

		query
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order });

		const foundUsers = await query.exec();

		return foundUsers;
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
		let userToUpdate = await User.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!userToUpdate) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		const existingUser = await User.where('deletedAt')
			.exists(false)
			.or([{ phoneNumber }, { email }])
			.findOne();

		if (existingUser) {
			throw {
				status: 409,
				message:
					'User with ' +
					(existingUser.phoneNumber === phoneNumber
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

			await userToUpdate.updateOne({
				$unset: { temporaryPassword: true }
			});
		}

		Object.keys(changes).forEach(
			key => (userToUpdate[key] = changes[key])
		);

		await userToUpdate.save();

		return userToUpdate;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const userToDelete = await User.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!userToDelete) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		await cartService.clearItems(userToDelete.cart);
		await Cart.deleteOne({ user: id });

		await userToDelete.deleteOne();
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

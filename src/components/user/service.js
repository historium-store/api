import { randomBytes } from 'crypto';
import { MAX_HISTORY_SIZE, hashPassword } from '../../utils.js';
import CartItem from '../cart-item/model.js';
import Cart from '../cart/model.js';
import Order from '../order/model.js';
import Product from '../product/model.js';
import User from './model.js';

const createOne = async userData => {
	const { phoneNumber, email } = userData;

	try {
		const existingUser = await User.where('deletedAt')
			.exists(false)
			.or([{ phoneNumber }, { email }])
			.select('-_id phoneNumber')
			.findOne()
			.lean();

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
		const { id: cart } = await Cart.create({ user: newUser.id });
		await newUser.updateOne({ $set: { cart } });

		return newUser.set('password').set('salt');
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const foundUser = await User.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.select('-password -salt')
			.findOne()
			.lean();

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

	try {
		return await User.where('deletedAt')
			.exists(false)
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order })
			.select('-password -salt')
			.lean();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { phoneNumber, email, password } = changes;

	try {
		const userToUpdate = await User.where('_id')
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

		if (phoneNumber || email) {
			const existingUser = await User.where('deletedAt')
				.exists(false)
				.or([{ phoneNumber }, { email }])
				.select('-_id phoneNumber')
				.findOne()
				.lean();

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
		}

		if (password) {
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

		return userToUpdate.set('password').set('salt');
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
			.select('cart')
			.exists(false)
			.findOne();

		if (!userToDelete) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		await CartItem.deleteMany({ cart: userToDelete.cart });
		await Cart.deleteOne({ user: userToDelete.id });

		await userToDelete.deleteOne();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const addToWishlist = async (user, product) => {
	try {
		const userToUpdate = await User.where('_id')
			.equals(user)
			.where('deletedAt')
			.select('_id')
			.exists(false)
			.findOne();

		if (!userToUpdate) {
			throw {
				status: 404,
				message: `User with id '${user}' not found`
			};
		}

		const existingProduct = await Product.where('_id')
			.equals(product)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne()
			.lean();

		if (!existingProduct) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		await userToUpdate.updateOne({ $push: { wishlist: product } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const removeFromWishlist = async (user, product) => {
	try {
		const userToUpdate = await User.where('_id')
			.equals(user)
			.where('deletedAt')
			.select('_id')
			.exists(false)
			.findOne();

		if (!userToUpdate) {
			throw {
				status: 404,
				message: `User with id '${user}' not found`
			};
		}

		const existingProduct = await Product.where('_id')
			.equals(product)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne()
			.lean();

		if (!existingProduct) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		await userToUpdate.updateOne({ $pull: { wishlist: product } });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const addToHistory = async (user, product) => {
	try {
		const userToUpdate = await User.where('_id')
			.equals(user)
			.where('deletedAt')
			.exists(false)
			.select('history')
			.findOne();

		if (!userToUpdate) {
			throw {
				status: 404,
				message: `User with id '${user}' not found`
			};
		}

		const existingProduct = await Product.where('_id')
			.equals(product)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne()
			.lean();

		if (!existingProduct) {
			throw {
				status: 404,
				message: `Product with id '${product}' not found`
			};
		}

		const productInHistory = userToUpdate.history.some(
			p => p.toHexString() === product
		);

		if (productInHistory) {
			return;
		}

		const historySize = userToUpdate.history.length;

		if (historySize === MAX_HISTORY_SIZE) {
			userToUpdate.history.pop();
		}

		userToUpdate.history.unshift(product);

		await userToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOrders = async (queryParams, user) => {
	const { orderBy, order } = queryParams;

	try {
		return await Order.where('user')
			.equals(user)
			.sort({ [orderBy ?? 'createdAt']: order ?? 'asc' });
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
	deleteOne,
	addToWishlist,
	removeFromWishlist,
	addToHistory,
	getOrders
};

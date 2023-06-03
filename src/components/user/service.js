import { randomBytes } from 'crypto';
import { hashPassword } from '../../utils.js';
import Basket from '../basket/model.js';
import User from './model.js';

const createOne = async userData => {
	// деструктуризация входных данных
	// для более удобного использования
	const { phoneNumber, email } = userData;

	try {
		// проверка существования пользователя
		// с входным номером телефона или почтой
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

		// генерация соли, хеширование пароля
		// и их привязка к входным данным
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

		await Basket.create({ user: newUser.id });

		return newUser;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		// проверка существования
		// пользователя с входным id
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
	// деструктуризация входных данных
	// для более удобного использования
	const { limit, offset: skip } = queryParams;

	const filter = {
		deletedAt: { $exists: false }
	};

	try {
		return await User.find(filter).limit(limit).skip(skip);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	// деструктуризация входных данных
	// для более удобного использования
	const { phoneNumber, email } = changes;

	try {
		// проверка существования
		// пользователя с входным id
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

		// проверка существования пользователя
		// с входным номером телефона или почтой
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

		// генерация новой соли
		// и хеширование пароля
		// если он был изменён
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
		// проверка существования
		// пользователя с входным id
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

		await Basket.deleteOne({ user: id });

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

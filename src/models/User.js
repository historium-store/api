import { User } from './mongo-utils/schemas.js';

export const createOne = async user => {
	try {
		const newUser = new User(user);

		const validationError = newUser.validateSync();
		if (validationError) {
			throw new Error(validationError.message);
		}

		await newUser.save().then(savedUser => {
			console.log(`${savedUser.email} added to db.`);
		});
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const getOne = async filter => {
	try {
		const user = await User.findOne(filter).exec();
		return user;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const updateOne = async (filter, update) => {
	try {
		const result = await User.updateOne(filter, update);
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const deleteOne = async filter => {
	try {
		const result = await User.deleteOne(filter);
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

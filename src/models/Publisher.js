import { Publisher } from './mongo-utils/schemas.js';

export const createOnes = async publisher => {
	try {
		const newPublisher = new Publisher(publisher);

		const validationError = newPublisher.validateSync();
		if (validationError) {
			throw new Error(validationError.message);
		}

		await newPublisher.save().then(savedPublisher => {
			console.log(`${savedPublisher.name} added to db.`);
		});
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const getOnes = async filter => {
	try {
		const publisher = await Publisher.findOne(filter).exec();
		return publisher;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const updateOnes = async (filter, update) => {
	try {
		const result = await Publisher.updateOne(filter, update);
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const deleteOnes = async filter => {
	try {
		const result = await Publisher.deleteOne(filter);
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

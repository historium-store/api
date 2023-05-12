import { Book } from './mongo-utils/schemas.js';

export const createOne = async book => {
	try {
		const newBook = new Book(book);

		const validationError = newBook.validateSync();
		if (validationError) {
			throw new Error(validationError.message);
		}

		await newBook.save().then(savedBook => {
			console.log(`${savedBook.email} added to db.`);
		});
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const getOne = async filter => {
	try {
		const book = await Book.findOne(filter).exec();
		return book;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const updateOne = async (filter, update) => {
	try {
		const result = await Book.updateOne(filter, update);
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export const deleteOne = async filter => {
	try {
		const result = await Book.deleteOne(filter);
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

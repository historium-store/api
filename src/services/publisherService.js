import { Book, Publisher } from '../models/index.js';
import bookService from './bookService.js';

const createOne = async publisherData => {
	const { name } = publisherData;

	if (await Publisher.exists({ name })) {
		throw {
			status: 409,
			message: `Publisher with name '${name}' already exists`
		};
	}

	try {
		return await Publisher.create(publisherData).populate([
			/* 'books', */
			'bookSeries'
		]);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const publisher = await Publisher.findById(id);

		if (!publisher) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		return publisher.populate([/* 'books', */ 'bookSeries']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Publisher.find().populate([
			/* 'books', */ 'bookSeries'
		]);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const publisherToUpdate = await Publisher.findById(id);

		if (!publisherToUpdate) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		const { name } = changes;

		if (await Publisher.exists({ name })) {
			throw {
				status: 409,
				message: `Publisher with name '${name}' already exists`
			};
		}

		if (changes.books) {
			const books = [];
			changes.books.forEach(async b =>
				books.push(await bookService.getOne(b))
			);

			const added = books.filter(
				b => !publisherToUpdate.books.map(b => `${b}`).includes(b)
			);
			await Book.updateMany(
				{ _id: added },
				{ $set: { publisher: publisherToUpdate.id } }
			);

			const removed = publisherToUpdate.books
				.map(b => `${b}`)
				.filter(b => !books.includes(b));
			await Book.updateMany(
				{ _id: removed },
				{ $unset: { publisher: true } }
			);
		}

		return await Publisher.findByIdAndUpdate(id, changes).populate([
			/* 'books', */
			'bookSeries'
		]);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const publisher = await Publisher.findById(id);

		if (!publisher) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		if (publisher.books.length) {
			throw {
				status: 400,
				message: "Can't delete publisher with books published"
			};
		}

		await publisher.deleteOne();

		return publisher.populate([/* 'books', */ 'bookSeries']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

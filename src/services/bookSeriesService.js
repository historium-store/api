import { Book, BookSeries, Publisher } from '../models/index.js';

const createOne = async bookSeriesData => {
	const { name, publisher } = bookSeriesData;

	if (await BookSeries.exists({ name, publisher })) {
		throw {
			status: 409,
			message: `Publisher with id '${publisher}' already has book series named '${name}'`
		};
	}

	try {
		const newBookSeries = await BookSeries.create(bookSeriesData);

		await Book.updateMany(
			{ _id: newBookSeries.books },
			{ $set: { series: newBookSeries.id } }
		);

		return newBookSeries;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const bookSeries = await BookSeries.findById(id);

		if (!bookSeries) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		return bookSeries;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await BookSeries.find();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const bookSeriesToUpdate = await BookSeries.findById(id);

		if (!bookSeriesToUpdate) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		const { name, publisher, books } = changes;

		if (await BookSeries.exists({ name, publisher })) {
			throw {
				status: 409,
				message: `Publisher with id '${publisher}' already has book series named '${name}'`
			};
		}

		if (books) {
			const added = books.filter(
				b => !bookSeriesToUpdate.books.map(b => `${b}`).includes(b)
			);
			await Book.updateMany(
				{ _id: added },
				{ $set: { series: bookSeriesToUpdate.id } }
			);

			const removed = bookSeriesToUpdate.books
				.map(b => `${b}`)
				.filter(b => !books.includes(b));
			await Book.updateMany(
				{ _id: removed },
				{ $unset: { series: true } }
			);
		}

		return await BookSeries.findByIdAndUpdate(id, changes, {
			new: true
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const deletedBookSeries = await BookSeries.findByIdAndDelete(id);

		if (!deletedBookSeries) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		await Book.updateMany(
			{ _id: deletedBookSeries.books },
			{ $unset: { series: true } }
		);

		return deletedBookSeries;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

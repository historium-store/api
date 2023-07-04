import Book from '../book/model.js';
import Publisher from '../publisher/model.js';
import BookSeries from './model.js';

const createOne = async bookSeriesData => {
	let { name, publisher, books } = bookSeriesData;
	books = books ?? [];

	try {
		const foundPublisher = await Publisher.where('_id')
			.equals(publisher)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundPublisher) {
			throw {
				status: 404,
				message: `Publisher with id '${publisher}' not found`
			};
		}

		const existingBookSeries = await BookSeries.where('publisher')
			.equals(publisher)
			.where('name')
			.equals(name)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (existingBookSeries) {
			throw {
				status: 409,
				message: `Publisher '${publisher.name}' already has book series named '${name}'`
			};
		}

		await Promise.all(
			books.map(async id => {
				const existingBook = await Book.where('_id')
					.equals(id)
					.where('deletedAt')
					.exists(false)
					.findOne();

				if (!existingBook) {
					throw {
						status: 404,
						message: `Book with id '${id}' not found`
					};
				}
			})
		);

		const newBookSeries = await BookSeries.create(bookSeriesData);

		await Publisher.updateOne(
			{ _id: publisher },
			{ $push: { bookSeries: newBookSeries } }
		);

		await Book.updateMany(
			{ _id: books },
			{ $set: { series: newBookSeries } }
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
		const foundBookSeries = await BookSeries.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!foundBookSeries) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		return foundBookSeries;
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
		return await BookSeries.where('deletedAt')
			.exists(false)
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
	const { name, books } = changes;

	try {
		const bookSeriesToUpdate = await BookSeries.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!bookSeriesToUpdate) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		if (name) {
			await bookSeriesToUpdate.populate('publisher');

			const existingBookSeries = await BookSeries.where('publisher')
				.equals(bookSeriesToUpdate.publisher.id)
				.where('name')
				.equals(name)
				.where('deletedAt')
				.exists(false)
				.findOne();

			if (existingBookSeries) {
				throw {
					status: 409,
					message: `Publisher '${bookSeriesToUpdate.publisher.name}' already has book series named '${name}'`
				};
			}
		}

		if (books) {
			await Promise.all(
				books.map(async id => {
					const existingBook = await Book.where('_id')
						.equals(id)
						.where('deletedAt')
						.exists(false)
						.findOne();

					if (!existingBook) {
						throw {
							status: 404,
							message: `Book with id '${id}' not found`
						};
					}
				})
			);

			const oldBookIds = bookSeriesToUpdate.books.map(b =>
				b.toHexString()
			);
			const addedBookIds = books.filter(b => !oldBookIds.includes(b));
			const removedBookIds = oldBookIds.filter(
				b => !books.includes(b)
			);

			await Book.updateMany(
				{ _id: addedBookIds },
				{ $set: { series: bookSeriesToUpdate.id } }
			);
			await Book.updateMany(
				{ _id: removedBookIds },
				{ $unset: { series: true } }
			);
		}

		Object.keys(changes).forEach(
			key => (bookSeriesToUpdate[key] = changes[key])
		);

		return await bookSeriesToUpdate.save();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const bookSeriesToDelete = await BookSeries.where('_id')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (!bookSeriesToDelete) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		await Publisher.updateOne(
			{ _id: bookSeriesToDelete.publisher },
			{ $pull: { bookSeries: bookSeriesToDelete.id } }
		);

		await Book.updateMany(
			{ _id: bookSeriesToDelete.books },
			{ $unset: { series: true } }
		);

		await bookSeriesToDelete.deleteOne();
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

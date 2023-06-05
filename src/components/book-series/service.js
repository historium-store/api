import Book from '../book/model.js';
import Publisher from '../publisher/model.js';
import BookSeries from './model.js';

const createOne = async bookSeriesData => {
	let { name, publisher, books } = bookSeriesData;
	books = books ?? [];

	try {
		const foundPublisher = await Publisher.findById(publisher);
		if (!foundPublisher || foundPublisher.deletedAt) {
			throw {
				status: 404,
				message: `Publisher with id '${publisher}' not found`
			};
		}

		const existingBookSeries = await BookSeries.exists({
			name,
			publisher,
			deletedAt: { $exists: false }
		});

		if (existingBookSeries) {
			throw {
				status: 409,
				message: `Publisher '${foundPublisher.name}' already has book series named '${name}'`
			};
		}

		const notFoundIndex = (
			await Book.find({
				_id: books
			})
		).findIndex(b => !b || b.deletedAt);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Book with id '${books[notFoundIndex]}' not found`
			};
		}

		const newBookSeries = await BookSeries.create(bookSeriesData);

		await Publisher.updateOne(
			{ _id: publisher },
			{ $push: { bookSeries: newBookSeries.id } }
		);

		await Book.updateMany(
			{ _id: books },
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
		const foundBookSeries = await BookSeries.findById(id);

		if (!foundBookSeries || foundBookSeries.deletedAt) {
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
		return await BookSeries.find({
			deletedAt: { $exists: false }
		})
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
	const { name, publisher, books } = changes;

	try {
		const bookSeriesToUpdate = await BookSeries.findById(id);

		if (!bookSeriesToUpdate || bookSeriesToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		let oldPublisher;
		let newPublisher;
		if (publisher) {
			newPublisher = await Publisher.findById(publisher);
			if (!newPublisher || newPublisher.deletedAt) {
				throw {
					status: 404,
					message: `Publisher with id '${publisher}' not found`
				};
			}

			oldPublisher = await Publisher.findById(
				bookSeriesToUpdate.publisher
			);

			const existingBookSeries = await BookSeries.exists({
				name,
				publisher,
				deletedAt: { $exists: false }
			});

			if (existingBookSeries) {
				throw {
					status: 409,
					message: `Publisher '${newPublisher.name}' already has book series named '${name}'`
				};
			}
		}

		const addedBookIds = [];
		const removedBookIds = [];
		if (books) {
			const notFoundIndex = (
				await Book.find({ _id: books })
			).findIndex(b => !b || b.deletedAt);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Book with id '${books[notFoundIndex]}' not found`
				};
			}

			const oldBookIds = bookSeriesToUpdate.books.map(b =>
				b.id.toString('hex')
			);

			addedBookIds.push(
				...books.filter(b => !oldBookIds.includes(b))
			);
			removedBookIds.push(
				...oldBookIds.filter(b => !books.includes(b))
			);
		}

		if (publisher && newPublisher.id !== oldPublisher.id) {
			await newPublisher.updateOne({
				$push: { bookSeries: bookSeriesToUpdate.id }
			});
			await oldPublisher.updateOne({
				$pull: { bookSeries: bookSeriesToUpdate.id }
			});
		}

		await Book.updateMany(
			{ _id: addedBookIds },
			{ $set: { series: bookSeriesToUpdate.id } }
		);
		await Book.updateMany(
			{ _id: removedBookIds },
			{ $unset: { series: true } }
		);

		await bookSeriesToUpdate.updateOne(changes);

		return await BookSeries.findById(id);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const bookSeriesToDelete = await BookSeries.findById(id);

		if (!bookSeriesToDelete || bookSeriesToDelete.deletedAt) {
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

		return bookSeriesToDelete;
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

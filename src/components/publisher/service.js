import BookSeries from '../book-series/model.js';
import Book from '../book/model.js';
import Publisher from './model.js';

const createOne = async publisherData => {
	let { name, books, bookSeries } = publisherData;
	books = books ?? [];
	bookSeries = bookSeries ?? [];

	try {
		if (await Publisher.exists({ name })) {
			throw {
				status: 409,
				message: `Publisher with name '${name}' already exists`
			};
		}

		let notFoundIndex = (await Book.find({ _id: books })).findIndex(
			b => !b
		);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Book with id '${books[notFoundIndex]}' not found`
			};
		}

		notFoundIndex = (
			await BookSeries.find({ _id: bookSeries })
		).findIndex(b => !b);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Book series with id '${bookSeries[notFoundIndex]}' not found`
			};
		}

		const newPublisher = await Publisher.create(publisherData);

		await Book.updateMany(
			{ _id: books },
			{ $set: { publisher: newPublisher.id } }
		);

		await BookSeries.updateMany(
			{ _id: bookSeries },
			{ $set: { publisher: newPublisher.id } }
		);

		return await Publisher.findById(newPublisher.id).populate([
			'books',
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
		if (!(await Publisher.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		return await Publisher.findById(id).populate([
			'books',
			'bookSeries'
		]);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Publisher.find().populate(['books', 'bookSeries']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { name, books, bookSeries } = changes;

	try {
		const publisherToUpdate = await Publisher.findById(id);

		if (!publisherToUpdate) {
			throw {
				status: 404,
				message: `Publisher with id '${id}' not found`
			};
		}

		if (await Publisher.exists({ name })) {
			throw {
				status: 409,
				message: `Publisher with name '${name}' already exists`
			};
		}

		const addedBookIds = [];
		const removedBookIds = [];
		if (books) {
			const notFoundIndex = (
				await Book.find({ _id: books })
			).findIndex(b => !b);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Book with id '${books[notFoundIndex]}' not found`
				};
			}

			const oldBookIds = publisherToUpdate.books.map(b =>
				b.id.toString('hex')
			);

			addedBookIds.push(
				...books.filter(b => !oldBookIds.includes(b))
			);
			removedBookIds.push(
				...oldBookIds.filter(b => !books.includes(b))
			);
		}

		const addedBookSeriesIds = [];
		const removedBookSeriesIds = [];
		if (bookSeries) {
			const notFoundIndex = (
				await Book.find({ _id: books })
			).findIndex(b => !b);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Book with id '${books[notFoundIndex]}' not found`
				};
			}

			const oldBookSeriesIds = publisherToUpdate.bookSeries.map(b =>
				b.id.toString('hex')
			);

			addedBookSeriesIds.push(
				...bookSeries.filter(b => !oldBookSeriesIds.includes(b))
			);
			removedBookSeriesIds.push(
				...oldBookSeriesIds.filter(b => !bookSeries.includes(b))
			);
		}

		await Book.updateMany(
			{ _id: addedBookIds },
			{ $set: { publisher: publisherToUpdate.id } }
		);
		await Book.updateMany(
			{ _id: removedBookIds },
			{ $set: { publisher: publisherToUpdate.id } }
		);

		await BookSeries.updateMany(
			{ _id: addedBookSeriesIds },
			{ $set: { publisher: publisherToUpdate.id } }
		);
		await BookSeries.updateMany(
			{ _id: removedBookSeriesIds },
			{ $set: { publisher: publisherToUpdate.id } }
		);

		return await Publisher.findByIdAndUpdate(id, changes, {
			new: true
		}).populate(['books', 'bookSeries']);
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

		if (publisher.bookSeries.length) {
			throw {
				status: 400,
				message: "Can't delete publisher with book series published"
			};
		}

		await publisher.deleteOne();

		return publisher;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };
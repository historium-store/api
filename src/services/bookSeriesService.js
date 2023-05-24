import { Book, BookSeries } from '../models/index.js';
import bookService from './bookService.js';
import publisherService from './publisherService.js';

const createOne = async bookSeriesData => {
	let { name, publisher: publisherId, books } = bookSeriesData;
	books = books ?? [];

	try {
		const publisher = await publisherService.getOne(publisherId);

		if (
			await BookSeries.exists({
				name,
				publisherId
			})
		) {
			throw {
				status: 409,
				message: `Publisher '${publisher.name}' already has book series named '${name}'`
			};
		}

		for (let book of books) {
			await bookService.getOne(book);
		}

		const newBookSeries = await BookSeries.create(bookSeriesData);

		await publisher.updateOne({
			$push: { bookSeries: newBookSeries.id }
		});

		await Book.updateMany(
			{ _id: books },
			{ $set: { series: newBookSeries.id } }
		);

		return await BookSeries.findById(newBookSeries.id)
			.populate('publisher')
			.populate({ path: 'books', populate: 'authors' });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		if (!(await BookSeries.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		return await BookSeries.findById(id)
			.populate('publisher')
			.populate({ path: 'books', populate: 'authors' });
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await BookSeries.find()
			.populate('publisher')
			.populate({ path: 'books', populate: 'authors' });
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

		if (!bookSeriesToUpdate) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

		let oldPublisher;
		let newPublisher;
		if (publisher) {
			oldPublisher = await publisherService.getOne(
				bookSeriesToUpdate.publisher
			);
			newPublisher = await publisherService.getOne(publisher);

			if (await BookSeries.exists({ name, publisher })) {
				throw {
					status: 409,
					message: `Publisher '${newPublisher.name}' already has book series named '${name}'`
				};
			}
		}

		const addedBookIds = [];
		const removedBookIds = [];
		if (books) {
			const oldBookIds = bookSeriesToUpdate.books.map(b =>
				b.id.toString('hex')
			);
			const newBookIds = [];
			for (let book of books) {
				newBookIds.push((await bookService.getOne(book)).id);
			}

			addedBookIds.push(
				...newBookIds.filter(b => !oldBookIds.includes(b))
			);
			removedBookIds.push(
				...oldBookIds.filter(b => !newBookIds.includes(b))
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

		return await BookSeries.findByIdAndUpdate(id, changes, {
			new: true
		})
			.populate('publisher')
			.populate({ path: 'books', populate: 'authors' });
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

		if (!bookSeriesToDelete) {
			throw {
				status: 404,
				message: `Book series with id '${id}' not found`
			};
		}

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

export default { createOne, getOne, getAll, updateOne, deleteOne };

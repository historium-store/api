import Book from '../book/model.js';
import Publisher from '../publisher/model.js';
import BookSeries from './model.js';

const createOne = async bookSeriesData => {
	let { name, publisher, books } = bookSeriesData;
	books = books ?? [];

	try {
		if (!(await Publisher.exists({ _id: publisher }))) {
			throw {
				status: 404,
				message: `Publisher with id '${publisher}' not found`
			};
		}

		if (
			await BookSeries.exists({
				name,
				publisher
			})
		) {
			throw {
				status: 409,
				message: `Publisher '${publisher.name}' already has book series named '${name}'`
			};
		}

		const notFoundIndex = (await Book.find({ _id: books })).findIndex(
			b => !b
		);
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

		return await BookSeries.findById(newBookSeries.id)
			.populate('publisher')
			.populate({
				path: 'books',
				populate: [
					'publisher',
					'series',
					'authors',
					'compilers',
					'translators',
					'illustrators',
					'editors',
					{
						path: 'product',
						populate: ['type', 'sections']
					}
				]
			});
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
			.populate({
				path: 'books',
				populate: [
					'publisher',
					'series',
					'authors',
					'compilers',
					'translators',
					'illustrators',
					'editors',
					{
						path: 'product',
						populate: ['type', 'sections']
					}
				]
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip } = queryParams;

	try {
		return await BookSeries.find()
			.limit(limit)
			.skip(skip)
			.populate('publisher')
			.populate({
				path: 'books',
				populate: [
					'publisher',
					'series',
					'authors',
					'compilers',
					'translators',
					'illustrators',
					'editors',
					{
						path: 'product',
						populate: ['type', 'sections']
					}
				]
			});
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
			if (!(await Publisher.exists({ _id: publisher }))) {
				throw {
					status: 404,
					message: `Publisher with id '${publisher}' not found`
				};
			}

			oldPublisher = await Publisher.findById(
				bookSeriesToUpdate.publisher
			);
			newPublisher = await Publisher.findById(publisher);

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
			const notFoundIndex = (
				await Book.find({ _id: books })
			).findIndex(b => !b);
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

		return await BookSeries.findByIdAndUpdate(id, changes, {
			new: true
		})
			.populate('publisher')
			.populate({
				path: 'books',
				populate: [
					'publisher',
					'series',
					'authors',
					'compilers',
					'translators',
					'illustrators',
					'editors',
					{
						path: 'product',
						populate: ['type', 'sections']
					}
				]
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
		const bookSeriesToDelete = await BookSeries.findById(id);

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

		return bookSeriesToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

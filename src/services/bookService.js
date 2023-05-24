import { Author, Book, BookSeries } from '../models/index.js';
import authorService from './authorService.js';
import bookSeriesService from './bookSeriesService.js';
import productService from './productService.js';
import publisherService from './publisherService.js';

const createOne = async bookData => {
	let {
		publisher: publisherId,
		authors,
		series: seriesId
	} = bookData;
	authors = authors ?? [];

	try {
		const publisher = await publisherService.getOne(publisherId);

		const series = await bookSeriesService.getOne(seriesId);

		for (let author of authors) {
			await authorService.getOne(author);
		}

		bookData.product = (
			await productService.createOne(bookData.product)
		).id;

		const newBook = await Book.create(bookData);

		// await publisher.updateOne({ $push: { books: newBook.id } });

		await series.updateOne({ $push: { books: newBook.id } });

		await Author.updateMany(
			{ _id: authors },
			{ $push: { books: newBook.id } }
		);

		return await Book.findById(newBook.id)
			.populate(['publisher', 'series', 'authors'])
			.populate({
				path: 'product',
				populate: ['type', 'sections']
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
		if (!(await Book.exists({ _id: id }))) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		return await Book.findById(id)
			.populate(['publisher', 'series', 'authors'])
			.populate({
				path: 'product',
				populate: ['type', 'sections']
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Book.find()
			.populate(['publisher', 'series', 'authors'])
			.populate({
				path: 'product',
				populate: ['type', 'sections']
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { product, publisher, authors, series } = changes;

	try {
		const bookToUpdate = await Book.findById(id);

		if (!bookToUpdate) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		if (product) {
			await productService.updateOne(bookToUpdate.product, product);

			delete changes.product;
		}

		let oldPublisher;
		let newPublisher;
		if (publisher) {
			oldPublisher = await publisherService.getOne(
				bookToUpdate.publisher
			);
			newPublisher = await publisherService.getOne(publisher);
		}

		let oldBookSeries;
		let newBookSeries;
		if (series) {
			oldBookSeries = await bookSeriesService.getOne(
				bookToUpdate.series
			);
			newBookSeries = await bookSeriesService.getOne(series);

			if (!oldBookSeries) {
				oldBookSeries = newBookSeries;
			}
		}

		const addedAuthorIds = [];
		const removedAuthorIds = [];
		if (authors) {
			const oldAuthorIds = bookToUpdate.authors.map(a =>
				a.id.toString('hex')
			);
			const newAuthorIds = [];
			for (let author of authors) {
				newAuthorIds.push((await authorService.getOne(author)).id);
			}

			addedAuthorIds.push(
				...newAuthorIds.filter(a => !oldAuthorIds.includes(a))
			);
			removedAuthorIds.push(
				...oldAuthorIds.filter(a => !newAuthorIds.includes(a))
			);
		}

		if (publisher && newPublisher.id !== oldPublisher.id) {
			await newPublisher.updateOne({
				$push: { books: bookToUpdate.id }
			});
			await oldPublisher.updateOne({
				$pull: { books: bookToUpdate.id }
			});
		}

		await Author.updateMany(
			{ _id: addedAuthorIds },
			{ $push: { books: bookToUpdate.id } }
		);
		await Author.updateMany(
			{ _id: removedAuthorIds },
			{ $pull: { books: bookToUpdate.id } }
		);

		if (series && newBookSeries.id !== oldBookSeries.id) {
			await newBookSeries.updateOne({
				$push: { books: bookToUpdate.id }
			});
			await oldBookSeries.updateOne({
				$pull: { books: bookToUpdate.id }
			});
		}

		return await Book.findByIdAndUpdate(id, changes, { new: true })
			.populate(['publisher', 'series', 'authors'])
			.populate({
				path: 'product',
				populate: ['type', 'sections']
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
		const bookToDelete = await Book.findById(id);

		if (!bookToDelete) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		// await Publisher.updateOne(
		// 	{ _id: deletedBook.publisher },
		// 	{ $pull: { books: deletedBook.id } }
		// );

		await productService.deleteOne(bookToDelete.product);

		if (bookToDelete.series) {
			await BookSeries.updateOne(
				{ _id: bookToDelete.series },
				{ $pull: { books: bookToDelete.id } }
			);
		}

		if (bookToDelete.authors) {
			await Author.updateMany(
				{ _id: bookToDelete.authors },
				{
					$pull: { books: bookToDelete.id }
				}
			);
		}

		return await Book.findByIdAndDelete(id)
			.populate(['publisher', 'series', 'authors'])
			.populate({
				path: 'product',
				populate: ['type', 'sections']
			});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

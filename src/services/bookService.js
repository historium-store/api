import { Author, Book, BookSeries } from '../models/index.js';
import authorService from './authorService.js';
import bookSeriesService from './bookSeriesService.js';
import productService from './productService.js';
import publisherService from './publisherService.js';

const createOne = async bookData => {
	try {
		const publisher = await publisherService.getOne(
			bookData.publisher
		);

		let bookSeries;
		if (bookData.series) {
			bookSeries = await bookSeriesService.getOne(bookData.series);
		}

		const authors = [];
		bookData.authors.forEach(async a =>
			authors.push(await authorService.getOne(a))
		);

		bookData.product = await productService.createOne(
			bookData.product
		).id;

		const newBook = await Book.create(bookData);

		// await publisher.updateOne({ $push: { books: newBook.id } });

		if (bookSeries) {
			await bookSeries.updateOne({ $push: { books: newBook.id } });
		}

		authors.forEach(
			async a => await a.updateOne({ $push: { books: newBook.id } })
		);

		return newBook
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
		const book = await Book.findById(id);

		if (!book) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		return book
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
	try {
		const bookToUpdate = await Book.findById(id);

		if (!bookToUpdate) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		if (changes.product) {
			await productService.updateOne(
				bookToUpdate.product,
				changes.product
			);

			delete changes.product;
		}

		if (changes.publisher) {
			const foundPublisher = await publisherService.getOne(
				changes.publisher
			);

			if (changes.publisher !== bookToUpdate.publisher) {
				changes.publisher = foundPublisher.id;
			}
		}

		if (changes.series) {
			const foundBookSeries = await bookSeriesService.getOne(
				changes.series
			);

			if (foundBookSeries.id !== bookToUpdate.series) {
				await BookSeries.findByIdAndUpdate(bookToUpdate.series, {
					$pull: { books: bookToUpdate.id }
				});
				await foundBookSeries.updateOne({
					$push: { books: bookToUpdate.id }
				});
			}
		}

		if (changes.authors) {
			const newAuthors = [];
			changes.authors.forEach(async a =>
				newAuthors.push(await authorService.getOne(a))
			);

			const added = newAuthors.filter(
				a => !bookToUpdate.authors.includes(a.id)
			);
			await Author.updateMany(
				{ _id: added },
				{ $addToSet: { books: bookToUpdate.id } }
			);

			const removed = bookToUpdate.authors
				.map(a => `${a}`)
				.filter(a => !newAuthors.map(s => s.id).includes(a));
			await Author.updateMany(
				{ _id: removed },
				{ $pull: { books: bookToUpdate.id } }
			);
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
		const deletedBook = await Book.findByIdAndDelete(id);

		if (!deletedBook) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		// await Publisher.updateOne(
		// 	{ _id: deletedBook.publisher },
		// 	{ $pull: { books: deletedBook.id } }
		// );

		await productService.deleteOne(deletedBook.product);

		if (deletedBook.series) {
			await BookSeries.updateOne(
				{ _id: deletedBook.series },
				{ $pull: { books: deletedBook.id } }
			);
		}

		if (deletedBook.authors) {
			await Author.updateMany(
				{ _id: deletedBook.authors },
				{
					$pull: { books: deletedBook.id }
				}
			);
		}

		return deletedBook
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

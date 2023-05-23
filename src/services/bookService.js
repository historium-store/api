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
		for (let authorId of bookData.authors) {
			authors.push(await authorService.getOne(authorId));
		}

		bookData.product = (
			await productService.createOne(bookData.product)
		).id;

		const newBook = await Book.create(bookData);
		// await publisher.updateOne({ $push: { books: newBook.id } });

		if (bookSeries) {
			await bookSeries.updateOne({ $push: { books: newBook.id } });
		}

		for (let author of authors) {
			await author.updateOne({ $push: { books: newBook.id } });
		}

		return Book.findById(newBook.id)
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
		if (!Book.exists({ _id: id })) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		return Book.findById(id)
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

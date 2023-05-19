import { Book, BookSeries, Publisher } from '../models/index.js';
import productService from './productService.js';

const createOne = async bookData => {
	try {
		const publisherExists =
			(await Publisher.findById(bookData.publisher)) !== null;

		if (!publisherExists) {
			throw {
				status: 404,
				message: `Publisher with id '${bookData.publisher}' not found`
			};
		}

		let bookSeries;
		if (bookData.series) {
			bookSeries = await BookSeries.findById(bookData.series);

			if (!bookSeries) {
				throw {
					status: 404,
					message: `Book series with id '${bookData.series}' not found`
				};
			}
		}

		const newProduct = await productService.createOne(
			bookData.product
		);
		bookData.product = newProduct.id;

		const newBook = await Book.create(bookData);

		if (bookSeries) {
			await bookSeries.updateOne({ $push: { books: newBook.id } });
		}

		return newBook;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const book = await Book.findById(id)
			.populate({
				path: 'product',
				populate: [{ path: 'type' }, { path: 'sections' }]
			})
			.populate('publisher');

		if (!book) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		return book;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		const books = await Book.find({})
			.populate({
				path: 'product',
				populate: [{ path: 'type' }, { path: 'sections' }]
			})
			.populate('publisher');
		return books;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	try {
		const book = await Book.findById(id);

		if (!book) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		if (changes.product) {
			await productService.updateOne(book.product, changes.product);
			delete changes.product;
		}

		if (changes.publisher) {
			const publisher = await Publisher.findById(changes.publisher);

			if (!publisher) {
				throw {
					status: 404,
					message: `Publisher with id '${changes.publisher}' not found`
				};
			}

			changes.publisher = publisher.id;
		}

		let bookSeries;
		if (changes.series) {
			bookSeries = await BookSeries.findById(changes.series);

			if (!bookSeries) {
				throw {
					status: 404,
					message: `Book series with id '${changes.series}' not found`
				};
			}
		}

		const bookToUpdate = await Book.findById(id);

		if (bookSeries && bookSeries.id !== bookToUpdate.series) {
			await BookSeries.findByIdAndUpdate(book.series, {
				$pull: { books: bookToUpdate.id }
			});
			await bookSeries.updateOne({
				$push: { books: bookToUpdate.id }
			});
		}

		await bookToUpdate.updateOne(changes);

		return await Book.findById(id)
			.populate({
				path: 'product',
				populate: [{ path: 'type' }, { path: 'sections' }]
			})
			.populate('publisher');
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const deletedBook = await Book.findByIdAndDelete(id)
			.populate({
				path: 'product',
				populate: [{ path: 'type' }, { path: 'sections' }]
			})
			.populate('publisher');

		if (!deletedBook) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		await productService.deleteOne(deletedBook.product);

		if (deletedBook.series) {
			await BookSeries.updateOne(
				{ _id: deletedBook.series },
				{ $pull: { books: deletedBook.id } }
			);
		}

		return deletedBook;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

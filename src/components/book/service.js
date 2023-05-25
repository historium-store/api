import productService from '../product/service.js';

import Author from '../author/model.js';
import BookSeries from '../book-series/model.js';
import Publisher from '../publisher/model.js';
import Book from './model.js';

const createOne = async bookData => {
	let { publisher, authors, series } = bookData;
	authors = authors ?? [];

	try {
		if (!(await Publisher.exists({ _id: publisher }))) {
			throw {
				status: 404,
				message: `Publisher with id '${publisher}' not found`
			};
		}

		if (!(await BookSeries.exists({ _id: series }))) {
			throw {
				status: 404,
				message: `Book series with id '${series}' not found`
			};
		}

		const notFoundIndex = (
			await Author.find({ _id: authors })
		).findIndex(p => !p);
		if (notFoundIndex > -1) {
			throw {
				status: 404,
				message: `Author with id '${authors[notFoundIndex]}' not found`
			};
		}

		bookData.product = (
			await productService.createOne(bookData.product)
		).id;

		const newBook = await Book.create(bookData);

		await Publisher.updateOne(
			{ _id: publisher },
			{ $push: { books: newBook.id } }
		);

		await BookSeries.updateOne(
			{ _id: series },
			{ $push: { books: newBook.id } }
		);

		await Author.updateMany(
			{ _id: authors },
			{ $push: { books: newBook.id } }
		);

		return await Book.findById(newBook.id)
			.populate([
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors'
			])
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
			.populate([
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors'
			])
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
			.populate([
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors'
			])
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
			if (!(await Publisher.exists({ _id: publisher }))) {
				throw {
					status: 404,
					message: `Publisher with id '${publisher}' not found`
				};
			}

			oldPublisher = await Publisher.findById(bookToUpdate.publisher);
			newPublisher = await Publisher.findById(publisher);
		}

		let oldBookSeries;
		let newBookSeries;
		if (series) {
			if (!(await BookSeries.exists({ _id: series }))) {
				throw {
					status: 404,
					message: `Book series with id '${series}' not found`
				};
			}

			oldBookSeries = await BookSeries.findById(bookToUpdate.series);
			newBookSeries = await BookSeries.findById(series);
		}

		const addedAuthorIds = [];
		const removedAuthorIds = [];
		if (authors) {
			const notFoundIndex = (
				await Author.find({ _id: authors })
			).findIndex(p => !p);
			if (notFoundIndex > -1) {
				throw {
					status: 404,
					message: `Author with id '${authors[notFoundIndex]}' not found`
				};
			}

			const oldAuthorIds = bookToUpdate.authors.map(a =>
				a.id.toString('hex')
			);

			addedAuthorIds.push(
				...authors.filter(a => !oldAuthorIds.includes(a))
			);
			removedAuthorIds.push(
				...oldAuthorIds.filter(a => !authors.includes(a))
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

		if (series && newBookSeries.id !== oldBookSeries.id) {
			await newBookSeries.updateOne({
				$push: { books: bookToUpdate.id }
			});
			await oldBookSeries.updateOne({
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

		return await Book.findByIdAndUpdate(id, changes, { new: true })
			.populate([
				'publisher',
				'series',
				'authors',
				'composers',
				'translators',
				'illustrators',
				'editors'
			])
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

		await Publisher.updateOne(
			{ _id: bookToDelete.publisher },
			{ $pull: { books: bookToDelete.id } }
		);

		await productService.deleteOne(bookToDelete.product);

		await BookSeries.updateOne(
			{ _id: bookToDelete.series },
			{ $pull: { books: bookToDelete.id } }
		);

		await Author.updateMany(
			{ _id: bookToDelete.authors },
			{
				$pull: { books: bookToDelete.id }
			}
		);

		await bookToDelete.deleteOne();

		return bookToDelete;
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

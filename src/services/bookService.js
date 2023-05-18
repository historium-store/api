import { Book, Publisher } from '../models/index.js';
import productService from './productService.js';

const createOne = async bookData => {
	const publisher = await Publisher.findById(bookData.publisher);

	if (!publisher) {
		throw {
			status: 404,
			message: `Publisher '${bookData.publisher}' not found`
		};
	}
	bookData.publisher = publisher.id;

	try {
		const product = await productService.createOne(bookData.product);
		bookData.product = product.id;

		return await Book.create(bookData);
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
			const publisher = await Publisher.findOne({
				name: changes.publisher
			});

			if (!publisher) {
				throw {
					status: 404,
					message: `Publisher '${bookData.publisher}' not found`
				};
			}
			changes.publisher = publisher.id;
		}

		return await Book.findByIdAndUpdate(id, changes, {
			new: true
		})
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
		const book = await Book.findByIdAndDelete(id)
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

		await productService.deleteOne(book.product);

		return book;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

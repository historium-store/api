import { Book, Product, Publisher } from '../models/index.js';
import productService from './productService.js';

const createOne = async bookData => {
	try {
		// создаст продукт если не существует, иначе кинет ошибку
		const product = await productService.createOne(bookData.product);

		// создаст издателя если не существует, иначе получит существующего
		const publisher = await Publisher.findOneAndUpdate(
			{
				name: bookData.publisher
			},
			{ name: bookData.publisher },
			{ upsert: true, new: true }
		);

		return await Book.create({
			...bookData,
			product: product.id,
			publisher: publisher.id
		});
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

const getOne = async id => {
	try {
		const book = await Book.findById(id).populate([
			'product',
			'publisher'
		]);

		if (!book) {
			throw {
				status: 404,
				message: `Book with id '${id}' not found`
			};
		}

		return book;
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

const getAll = async () => {
	try {
		return await Book.find({}).populate(['product', 'publisher']);
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
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
		}

		delete changes.product;

		if (changes.publisher) {
			const { id } = await Publisher.findOneAndUpdate(
				{ name: changes.publisher },
				{ name: changes.publisher },
				{ upsert: true, new: true }
			);

			changes.publisher = id;
		}

		return await Book.findByIdAndUpdate(id, changes, {
			new: true
		}).populate(['product', 'publisher']);
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

export default { createOne, getOne, getAll, updateOne };

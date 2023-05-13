import { Book, Publisher } from '../models/index.js';
import productService from './productService.js';

const createOne = async bookData => {
	try {
		const product = await productService.createOne(bookData.product);
		const publisher = await Publisher.create({
			name: bookData.publisher
		});

		return await Book.create({
			...bookData,
			product: product.id,
			publisher: publisher.id
		});
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

export default { createOne };

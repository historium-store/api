import { randomUUID } from 'crypto';
import Book from '../models/Book.js';
// import authorService from './authorService.js';
import productService from './productService.js';
import publisherService from './publisherService.js';

const createOne = bookData => {
	try {
		const product = productService.createOne(bookData.product);
		// const author = authorService.createOne({
		// 	fullName: bookData.author
		// });
		const publisher = publisherService.createOne({
			name: bookData.publisher
		});
		const now = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});

		return Book.createOne({
			id: randomUUID(),
			createdAt: now,
			updatedAt: now,
			...bookData,
			product: product.id,
			// author: author.id,
			publisher: publisher.id
		});
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

export default { createOne };

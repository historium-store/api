import { randomUUID } from 'crypto';
import Book from '../models/Book.js';
import authorService from './authorService.js';
import productService from './productService.js';
import publisherService from './publisherService.js';

const createOne = bookData => {
	try {
		const product = productService.createOne(bookData.product);
		const author = authorService.createOne(bookData.author);
		const publisher = publisherService.createOne(bookData.publisher);
		const date = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});

		return Book.createOne({
			id: randomUUID(),
			createdAt: date,
			updatedAt: date,
			...bookData,
			product: product.id,
			author: author.id,
			publisher: publisher.id
		});
	} catch (err) {
		throw err;
	}
};

export default { createOne };

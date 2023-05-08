import { randomUUID } from 'crypto';
import Author from '../models/Author.js';

const createOne = authorData => {
	try {
		const date = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});

		return Author.createOne({
			id: randomUUID(),
			createdAt: date,
			updatedAt: date,
			...authorData
		});
	} catch (err) {
		throw err;
	}
};

export default { createOne };

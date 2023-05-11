import { randomUUID } from 'crypto';
import Author from '../models/Author.js';

const createOne = authorData => {
	try {
		const now = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});

		return Author.createOne({
			id: randomUUID(),
			createdAt: now,
			updatedAt: now,
			...authorData
		});
	} catch (err) {
		throw err;
	}
};

export default { createOne };

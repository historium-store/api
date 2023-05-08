import { randomUUID } from 'crypto';
import Publisher from '../models/Publisher.js';

const createOne = publisherData => {
	try {
		const date = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});

		return Publisher.createOne({
			id: randomUUID(),
			createdAt: date,
			updatedAt: date,
			...publisherData
		});
	} catch (err) {
		throw err;
	}
};

export default { createOne };

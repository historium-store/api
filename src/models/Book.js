import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = book => {
	try {
		db.books.push(book);
		saveDatabase(db);
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}

	return book;
};

export default { createOne };

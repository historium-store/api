import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = book => {
	try {
		db.books.push(book);
		saveDatabase(db);

		return book;
	} catch (err) {
		throw {
			status: 500,
			message: err
		};
	}
};

export default { createOne };

import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = author => {
	try {
		db.authors.push(author);
		saveDatabase(db);
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}

	return author;
};

export default { createOne };

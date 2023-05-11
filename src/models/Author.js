import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = author => {
	try {
		db.authors.push(author);
		saveDatabase(db);

		return author;
	} catch (err) {
		throw {
			status: 500,
			message: err
		};
	}
};

export default { createOne };

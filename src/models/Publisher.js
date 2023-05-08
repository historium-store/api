import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = publisher => {
	try {
		db.publishers.push(publisher);
		saveDatabase(db);
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}

	return publisher;
};

export default { createOne };

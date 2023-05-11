import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = publisher => {
	try {
		db.publishers.push(publisher);
		saveDatabase(db);

		return publisher;
	} catch (err) {
		throw {
			status: 500,
			message: err
		};
	}
};

export default { createOne };

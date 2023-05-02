import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = user => {
	try {
		const exists = db.users.findIndex(u => u.email === user.email) > -1;

		if (exists) {
			throw {
				status: 409,
				message: 'User already exists'
			};
		}

		db.users.push(user);
		saveDatabase(db);
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}

	return user;
};

const getOne = criteria => {
	let user = null;
	try {
		user = db.users.find(u =>
			Object.keys(criteria).every(key => u[key] === criteria[key])
		);

		if (!user) {
			throw {
				status: 404,
				message: 'User not found'
			};
		}
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}

	return user;
};

export default { createOne, getOne };

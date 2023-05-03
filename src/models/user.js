import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = user => {
	if (exists({ phoneNumber: user.phoneNumber })) {
		throw {
			status: 400,
			message: `User with phone number '${userData.phoneNumber}' already exists`
		};
	}

	if (exists({ email: user.email })) {
		throw {
			status: 400,
			message: `User with email '${userData.email}' already exists`
		};
	}

	try {
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

const exists = criteria => {
	let exists = null;
	try {
		exists =
			db.users.findIndex(u =>
				Object.keys(criteria).every(key => u[key] === criteria[key])
			) > -1;
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}

	return exists;
};

export default { createOne, getOne, exists };

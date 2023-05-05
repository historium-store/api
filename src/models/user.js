import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = user => {
	if (exists({ phoneNumber: user.phoneNumber })) {
		throw {
			status: 400,
			message: `User with phone number '${user.phoneNumber}' already exists`
		};
	}

	if (exists({ email: user.email })) {
		throw {
			status: 400,
			message: `User with email '${user.email}' already exists`
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
				message: `User not found`
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

const updateOne = (id, changes) => {
	if (exists({ phoneNumber: changes.phoneNumber })) {
		throw {
			status: 400,
			message: `User with phone number '${changes.phoneNumber}' already exists`
		};
	}

	if (exists({ email: changes.email })) {
		throw {
			status: 400,
			message: `User with email '${changes.email}' already exists`
		};
	}

	let user = null;
	try {
		const indexToUpdate = db.users.findIndex(u => u.id == id);

		if (indexToUpdate == -1) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		user = {
			...db.users[indexToUpdate],
			...changes,
			updatedAt: new Date().toLocaleString('ua-UA', {
				timeZone: 'Europe/Kyiv'
			})
		};

		db.users[indexToUpdate] = user;
		saveDatabase(db);
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

export default { createOne, getOne, updateOne, exists };

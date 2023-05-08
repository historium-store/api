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
	try {
		const user = db.users.find(u =>
			Object.keys(criteria).every(key => u[key] === criteria[key])
		);

		if (!user) {
			throw {
				status: 404,
				message: `User not found`
			};
		}

		return user;
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}
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

	try {
		const indexToUpdate = db.users.findIndex(u => u.id == id);

		if (indexToUpdate == -1) {
			throw {
				status: 404,
				message: `User with id '${id}' not found`
			};
		}

		const user = {
			...db.users[indexToUpdate],
			...changes,
			updatedAt: new Date().toLocaleString('ua-UA', {
				timeZone: 'Europe/Kyiv'
			})
		};

		db.users[indexToUpdate] = user;
		saveDatabase(db);

		return user;
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}
};

const exists = criteria => {
	try {
		return (
			db.users.findIndex(u =>
				Object.keys(criteria).every(key => u[key] === criteria[key])
			) > -1
		);
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}
};

export default { createOne, getOne, updateOne, exists };

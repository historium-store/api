import db from './db.json' assert { type: 'json' };
import { saveDatabase } from './utils.js';

const createOne = product => {
	try {
		const exists =
			db.products.findIndex(
				p => p.code === product.code && !p.deletedAt
			) > -1;

		if (exists) {
			throw {
				status: 409,
				message: `Product with code '${product.code}' already exists`
			};
		}

		db.products.push(product);
		saveDatabase(db);

		return product;
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}
};

const getOne = criteria => {
	try {
		const product = db.products.find(p =>
			Object.keys(criteria).every(key => p[key] === criteria[key])
		);

		if (!product || product.deletedAt) {
			throw {
				status: 404,
				message: `Product not found`
			};
		}

		return product;
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}
};

const getAll = () => {
	try {
		return db.products.filter(p => !p.deletedAt);
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}
};

const updateOne = (id, changes) => {
	try {
		const exists =
			db.products.findIndex(p => p.code === changes.code) > -1;

		if (exists) {
			throw {
				status: 409,
				message: `Product with code '${changes.code}' already exists`
			};
		}

		const indexToUpdate = db.products.findIndex(p => p.id == id);

		if (indexToUpdate == -1 || db.products[indexToUpdate].deletedAt) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		const product = {
			...db.products[indexToUpdate],
			...changes,
			updatedAt: new Date().toLocaleString('ua-UA', {
				timeZone: 'Europe/Kyiv'
			})
		};

		db.products[indexToUpdate] = product;
		saveDatabase(db);

		return product;
	} catch (err) {
		throw {
			status: err?.status || 500,
			message: err?.message || err
		};
	}
};

const deleteOne = id => {
	try {
		const indexToDelete = db.products.findIndex(p => p.id == id);

		if (indexToDelete == -1 || db.products[indexToDelete].deletedAt) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		const product = {
			...db.products[indexToDelete],
			deletedAt: new Date().toLocaleString('ua-UA', {
				timeZone: 'Europe/Kyiv'
			})
		};

		db.products[indexToDelete] = product;
		saveDatabase(db);

		return product;
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
			db.products.findIndex(u =>
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

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne,
	exists
};

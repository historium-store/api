import { randomUUID } from 'crypto';
import Product from '../models/Product.js';

const createOne = productData => {
	try {
		const now = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});
		const code =
			Math.max(...Product.getAll(true).map(p => +p.code)) + 1;

		return Product.createOne({
			id: randomUUID(),
			createdAt: now,
			updatedAt: now,
			code: `${code}`,
			...productData
		});
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

const getOne = id => {
	try {
		return Product.getOne({ id });
	} catch (err) {
		throw err;
	}
};

const getAll = () => {
	try {
		return Product.getAll();
	} catch (err) {
		throw err;
	}
};

const updateOne = (id, changes) => {
	try {
		return Product.updateOne(id, changes);
	} catch (err) {
		throw err;
	}
};

const deleteOne = id => {
	try {
		return Product.deleteOne(id);
	} catch (err) {
		throw err;
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

import { randomUUID } from 'crypto';
import Product from '../models/Product.js';

const createOne = productData => {
	try {
		const date = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});
		const code = Math.max(...Product.getAll().map(p => +p.code)) + 1;

		return Product.createOne({
			id: randomUUID(),
			createdAt: date,
			updatedAt: date,
			code: `${code}`,
			...productData
		});
	} catch (err) {
		throw err;
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

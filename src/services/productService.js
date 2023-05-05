import { randomUUID } from 'crypto';
import Product from '../models/Product.js';

const createOne = productData => {
	let product = null;
	try {
		const date = new Date().toLocaleString('ua-UA', {
			timeZone: 'Europe/Kyiv'
		});

		product = Product.createOne({
			id: randomUUID(),
			createdAt: date,
			updatedAt: date,
			deletedAt: null,
			...productData
		});
	} catch (err) {
		throw err;
	}

	return product;
};

const getOne = id => {
	let product = null;
	try {
		product = Product.getOne({ id });
	} catch (err) {
		throw err;
	}

	return product;
};

const getAll = () => {
	try {
		return Product.getAll();
	} catch (err) {
		throw err;
	}
};

const updateOne = (id, changes) => {
	let product = null;
	try {
		product = Product.updateOne(id, changes);
	} catch (err) {
		throw err;
	}

	return product;
};

const deleteOne = id => {
	let product = null;
	try {
		product = Product.deleteOne(id);
	} catch (err) {
		throw err;
	}

	return product;
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

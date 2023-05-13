import Product from '../models/Product.js';

const createOne = async productData => {
	try {
		const code =
			Math.max(...(await Product.find({})).map(p => +p.code)) + 1;

		return await Product.create({
			code: isFinite(code) ? `${code}` : '100000',
			...productData
		});
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

const getOne = async id => {
	try {
		return await Product.findById(id);
	} catch (err) {
		throw err;
	}
};

const getAll = async () => {
	try {
		return await Product.find({});
	} catch (err) {
		throw err;
	}
};

const updateOne = async (id, changes) => {
	try {
		return await Product.findByIdAndUpdate(id, changes, {
			new: true
		});
	} catch (err) {
		throw err;
	}
};

const deleteOne = async id => {
	try {
		return await Product.findByIdAndDelete(id);
	} catch (err) {
		throw err;
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

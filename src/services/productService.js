import { Product } from '../models/index.js';

const createOne = async productData => {
	const product = await Product.findOne({
		type: productData.type,
		name: productData.name
	});

	if (product) {
		throw {
			status: 409,
			message: `Product with type '${product.type}' & name '${product.name}' already exists`
		};
	}

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
		const product = await Product.findById(id);

		if (!product) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		return product;
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

const getAll = async () => {
	try {
		return await Product.find({});
	} catch (err) {
		throw { status: 500, message: err };
	}
};

const updateOne = async (id, changes) => {
	try {
		const product = await Product.findByIdAndUpdate(id, changes, {
			new: true
		});

		if (!product) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		return product;
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

const deleteOne = async id => {
	try {
		const product = await Product.findByIdAndDelete(id);

		if (!product) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		return product;
	} catch (err) {
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

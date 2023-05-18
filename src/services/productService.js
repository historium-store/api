import { Product, ProductType, Section } from '../models/index.js';

const createOne = async productData => {
	try {
		// TODO: хранить последний использованный код в базе (триггер)
		const codes = (await Product.find({})).map(p => +p.code);
		const code = codes.length
			? `${Math.max(...codes) + 1}`
			: '100000';
		productData.code = code;

		if (!(await ProductType.findById(productData.type))) {
			throw {
				status: 404,
				message: `Product type with id '${productData.type}' not found`
			};
		}

		for (let sectionId of productData.sections) {
			if (!(await Section.findById(sectionId))) {
				throw {
					status: 404,
					message: `Section with id '${sectionId}' not found`
				};
			}
		}

		productData.reviews = [];

		return await Product.create(productData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const product = await Product.findById(id).populate([
			'type',
			'sections'
		]);

		if (!product) {
			throw {
				status: 404,
				message: `Product with id '${id}' not found`
			};
		}

		return product;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await Product.find({}).populate(['type', 'sections']);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
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
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
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
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

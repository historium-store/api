import { Product } from '../models/index.js';

const createOne = async productData => {
	try {
		// TODO: хранить последний использованный код в базе (триггер)
		const codes = (await Product.find({})).map(p => +p.code);
		const code = codes.length
			? `${Math.max(...codes) + 1}`
			: '100000';
		productData.code = code;

		// TODO: сделать поле количества опциональным
		productData.quantity = 1;

		// TODO: создать модель ProductType
		// let type = await ProductType.findOne({name: productData.type});
		// if (!type) {
		// 	throw {
		// 		status: 404,
		// 		message: `Product type '${productData.type}' not found`
		// 	}
		// }
		// productData.type = type.id;

		// TODO: создать модель Section
		// let sections = [];
		// for (let section of productData.sections) {
		// 	sections.push(
		// 		await Section.findOneAndUpdate(
		// 			{
		// 				name: section
		// 			},
		// 			{ name: section },
		// 			{ upsert: true, new: true }
		// 		)
		// 	);
		// }
		// productData.sections = sections.map(s => s.id);

		// TODO: добавить свойства type и sections для модели продукта
		return await Product.create(productData);
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
		throw { status: err.status ?? 500, message: err.message ?? err };
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

import { Product } from '../models/index.js';

const createOne = async productData => {
	// проверка на существование продукта
	// такого же типа и с таким же названием
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
		// НУЖНА ДОРАБОТКА
		// последний использованный код нужно хранить в базе,
		// при добавлении нового продукта должен будет
		// срабатывать триггер, который будет увеличивать
		// его значение на единицу
		const code =
			Math.max(...(await Product.find({})).map(p => +p.code)) + 1;

		console.log(productData.images);
		delete productData.images;

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
		throw { status: err.status ?? 500, message: err.message ?? err };
	}
};

const updateOne = async (id, changes) => {
	const product = await Product.findOne({
		type: changes.type,
		name: changes.name
	});

	if (product) {
		throw {
			status: 409,
			message: `Product with type '${product.type}' & name '${product.name}' already exists`
		};
	}

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

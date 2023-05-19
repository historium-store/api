import { ProductType } from '../models/index.js';

const createOne = async productTypeData => {
	const exists =
		(await ProductType.findOne({ name: productTypeData.name })) !==
		null;

	if (exists) {
		throw {
			status: 409,
			message: `Product type with name '${productTypeData.name}' already exists`
		};
	}

	try {
		return await ProductType.create(productTypeData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getOne = async id => {
	try {
		const author = await ProductType.findById(id);

		if (!author) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		return author;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await ProductType.find({});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const exists =
		(await ProductType.findOne({ name: changes.name })) !== null;

	if (exists) {
		throw {
			status: 409,
			message: `Product type with name '${changes.name}' already exists`
		};
	}

	try {
		const author = await ProductType.findByIdAndUpdate(id, changes, {
			new: true
		});

		if (!author) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		return author;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const author = await ProductType.findByIdAndDelete(id);

		if (!author) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		return author;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

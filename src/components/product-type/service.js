import ProductType from './model.js';

const createOne = async productTypeData => {
	const { name } = productTypeData;

	try {
		if (await ProductType.exists({ name })) {
			throw {
				status: 409,
				message: `Product type with name '${name}' already exists`
			};
		}

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
		const productType = await ProductType.findById(id);

		if (!productType) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		return productType;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async () => {
	try {
		return await ProductType.find();
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const updateOne = async (id, changes) => {
	const { name } = changes;

	try {
		const productTypeToUpdate = await ProductType.findById(id);

		if (!productTypeToUpdate) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		if (await ProductType.exists({ name })) {
			throw {
				status: 409,
				message: `Product type with name '${name}' already exists`
			};
		}

		return await ProductType.findByIdAndUpdate(id, changes, {
			new: true
		});
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const deleteOne = async id => {
	try {
		const productTypeToDelete = await ProductType.findById(id);

		if (!productTypeToDelete) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		productTypeToDelete.deleteOne();

		return productTypeToDelete;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default { createOne, getOne, getAll, updateOne, deleteOne };

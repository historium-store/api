import ProductType from './model.js';

const createOne = async productTypeData => {
	const { name } = productTypeData;

	try {
		const existsingProductType = await ProductType.exists({
			name,
			deletedAt: { $exists: false }
		});

		if (existsingProductType) {
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
		const foundProductType = await ProductType.findById(id);

		if (!foundProductType) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		return foundProductType;
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

const getAll = async queryParams => {
	const { limit, offset: skip, orderBy, order } = queryParams;

	try {
		return await ProductType.find({
			deletedAt: { $exists: false }
		})
			.limit(limit)
			.skip(skip)
			.sort({ [orderBy]: order });
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

		if (!productTypeToUpdate || productTypeToUpdate.deletedAt) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		const existsingProductType = await ProductType.exists({
			name,
			deletedAt: { $exists: false }
		});
		if (existsingProductType) {
			throw {
				status: 409,
				message: `Product type with name '${name}' already exists`
			};
		}

		await productTypeToUpdate.updateOne(changes);

		return await ProductType.findById(id);
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

		if (!productTypeToDelete || productTypeToDelete.deletedAt) {
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

export default {
	createOne,
	getOne,
	getAll,
	updateOne,
	deleteOne
};

import Product from '../product/model.js';
import ProductType from './model.js';

const createOne = async productTypeData => {
	const { name } = productTypeData;

	try {
		const existsingProductType = await ProductType.where('name')
			.equals(name)
			.findOne();

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
		return await ProductType.find()
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

		if (!productTypeToUpdate) {
			throw {
				status: 404,
				message: `Product type with id '${id}' not found`
			};
		}

		if (name) {
			const existsingProductType = await ProductType.where('name')
				.equals(name)
				.findOne();

			if (existsingProductType) {
				throw {
					status: 409,
					message: `Product type with name '${name}' already exists`
				};
			}
		}

		Object.keys(changes).forEach(
			key => (productTypeToUpdate[key] = changes[key])
		);

		return await productTypeToUpdate.save();
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

		const productExists = await Product.where('type')
			.equals(id)
			.where('deletedAt')
			.exists(false)
			.findOne();

		if (productExists) {
			throw {
				status: 400,
				message:
					"Can't delete product type while some products are using it"
			};
		}

		await productTypeToDelete.deleteOne();
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

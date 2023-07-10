import Brand from './model.js';

const createOne = async brandData => {
	const { name } = brandData;

	try {
		const brandExists = await Brand.where('name')
			.equals(name)
			.where('deletedAt')
			.exists(false)
			.select('_id')
			.findOne()
			.lean();

		if (brandExists) {
			throw {
				status: 409,
				message: `Brand with name '${name}' already exists`
			};
		}

		return await Brand.create(brandData);
	} catch (err) {
		throw {
			status: err.status ?? 500,
			message: err.message ?? err
		};
	}
};

export default {
	createOne
};
